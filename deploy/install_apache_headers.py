#!/usr/bin/env python3
"""
Installe les en-têtes de cache Apache (deploy/apache-cache-headers.conf) sur le VPS, de façon
idempotente. Réutilise les accès SSH de deploy.py (même dossier, ignoré par git).

Enchaîne :
  1. upload de apache-cache-headers.conf → /etc/apache2/conf-available/avtrans-cache-headers.conf
  2. a2enmod headers
  3. ajout de « Include conf-available/avtrans-cache-headers.conf » dans chaque <VirtualHost>
     dont le DocumentRoot est le site (fichier sauvegardé en *.bak-cache-headers avant édition)
  4. apachectl configtest → systemctl reload apache2 (vhosts restaurés si configtest échoue)
  5. vérification des en-têtes réellement servis (index.html et version.json)

Usage :
    python deploy/install_apache_headers.py            # installe
    python deploy/install_apache_headers.py --dry-run  # montre les vhosts concernés, ne modifie rien
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import deploy  # noqa: E402  (accès SSH, run_remote, http_get, PUBLIC_URL…)

CONF_NAME = "avtrans-cache-headers.conf"
LOCAL_CONF = os.path.join(deploy.PROJECT_ROOT, "deploy", "apache-cache-headers.conf")
REMOTE_TMP_CONF = f"/tmp/{CONF_NAME}"

# Script exécuté sur le VPS via sudo. Idempotent : peut être relancé sans effet de bord.
REMOTE_INSTALL = r"""
set -euo pipefail
WEB_DIR='__WEB_DIR__'
CONF='__CONF__'
SRC='__SRC__'
DRY_RUN=__DRY_RUN__

# 1. vhosts dont le DocumentRoot est le site
mapfile -t VHOSTS < <(grep -lE "^[[:space:]]*DocumentRoot[[:space:]]+\"?${WEB_DIR}/?\"?[[:space:]]*$" /etc/apache2/sites-enabled/* 2>/dev/null || true)
if [ "${#VHOSTS[@]}" -eq 0 ]; then
  echo "AUCUN vhost de sites-enabled n'a DocumentRoot ${WEB_DIR}. DocumentRoot trouvés :"
  grep -rn DocumentRoot /etc/apache2/sites-enabled/ || true
  exit 2
fi
echo "vhosts concernés :"
for f in "${VHOSTS[@]}"; do
  real=$(readlink -f "$f")
  if grep -q "conf-available/${CONF}" "$real"; then state="Include déjà présent"; else state="Include à ajouter"; fi
  echo "  • $real — $state"
done
echo "mod_headers : $(apache2ctl -M 2>/dev/null | grep -q headers_module && echo actif || echo inactif)"
if [ -f "/etc/apache2/conf-available/${CONF}" ]; then
  if cmp -s "$SRC" "/etc/apache2/conf-available/${CONF}"; then echo "conf : identique à la version locale"; else echo "conf : présente mais différente, sera remplacée"; fi
else
  echo "conf : absente, sera installée"
fi
if [ "$DRY_RUN" = "1" ]; then echo "DRY-RUN : aucune modification"; exit 0; fi

# 2. conf + module
install -m 644 "$SRC" "/etc/apache2/conf-available/${CONF}"
a2enmod -q headers

# 3. Include dans chaque <VirtualHost> (avant chaque </VirtualHost>)
CHANGED=()
for f in "${VHOSTS[@]}"; do
  real=$(readlink -f "$f")
  if grep -q "conf-available/${CONF}" "$real"; then continue; fi
  cp -a "$real" "$real.bak-cache-headers"
  sed -i "s#^\([[:space:]]*\)</VirtualHost>#\1    Include conf-available/${CONF}\n\1</VirtualHost>#" "$real"
  CHANGED+=("$real")
  echo "modifié : $real (sauvegarde : $real.bak-cache-headers)"
done

# 4. configtest puis reload — restauration si la config est invalide
if apachectl configtest 2>&1; then
  systemctl reload apache2
  echo "RELOAD_OK"
else
  for real in "${CHANGED[@]:-}"; do
    [ -n "$real" ] && [ -f "$real.bak-cache-headers" ] && cp -a "$real.bak-cache-headers" "$real" && echo "restauré : $real"
  done
  echo "CONFIGTEST_FAILED"
  exit 3
fi
"""


def check_headers():
    """Vérifie en ligne que index.html et version.json sont servis sans cache."""
    ok = True
    for path_ in ("/", "/version.json"):
        status, headers, _ = deploy.http_get(f"{deploy.PUBLIC_URL}{path_}")
        cache_control = headers.get("cache-control", "")
        if status == 200 and any(token in cache_control for token in ("no-cache", "no-store")):
            print(f"✅ {path_:<14} Cache-Control: {cache_control}")
        else:
            ok = False
            print(f"⚠️  {path_:<14} Cache-Control: {cache_control or 'absent'} (HTTP {status})")
    return ok


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-n", "--dry-run", action="store_true", help="affiche les vhosts concernés sans rien modifier")
    args = parser.parse_args()

    if not os.path.isfile(LOCAL_CONF):
        deploy.die(f"Fichier introuvable : {LOCAL_CONF}")

    deploy.print_step("EN-TÊTES DE CACHE APACHE" + (" (DRY-RUN)" if args.dry_run else ""))
    print(f"   • Conf locale : {LOCAL_CONF}")
    print(f"   • Site        : {deploy.REMOTE_WEB_DIR}")
    print(f"   • URL         : {deploy.PUBLIC_URL}")

    script = (
        REMOTE_INSTALL.replace("__WEB_DIR__", deploy.REMOTE_WEB_DIR)
        .replace("__CONF__", CONF_NAME)
        .replace("__SRC__", REMOTE_TMP_CONF)
        .replace("__DRY_RUN__", "1" if args.dry_run else "0")
    )

    ssh = deploy.ssh_connect()
    sftp = None
    try:
        sftp = ssh.open_sftp()
        sftp.put(LOCAL_CONF, REMOTE_TMP_CONF)
        code, out, err = deploy.run_remote(ssh, script, "Installation sur le serveur", check=False, sudo=True)
        print(out)
        if err:
            print(err)
        if code != 0:
            deploy.die(f"Installation échouée (exit {code})", code)
    finally:
        try:
            deploy.run_remote(ssh, f"rm -f {REMOTE_TMP_CONF}", check=False)
        except Exception:
            pass
        if sftp:
            sftp.close()
        ssh.close()

    if args.dry_run:
        return

    deploy.print_step("VÉRIFICATION EN LIGNE")
    if check_headers():
        print("\n🎉 En-têtes de cache en place : les clients détecteront désormais chaque mise à jour")
    else:
        print("\n⚠️  Les en-têtes ne sont pas visibles en ligne : un cache intermédiaire ou un autre vhost répond ?")


if __name__ == "__main__":
    try:
        main()
    except deploy.paramiko.AuthenticationException:
        deploy.die("Authentification SSH refusée (vérifiez SSH_PASSWORD dans deploy.py)")
    except deploy.paramiko.SSHException as e:
        deploy.die(f"Erreur SSH : {e}")
    except RuntimeError as e:
        deploy.die(str(e))
    except OSError as e:
        deploy.die(f"Erreur système/réseau : {e}")
    except KeyboardInterrupt:
        deploy.die("Interrompu", code=130)
