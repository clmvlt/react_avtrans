import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { RootLayout } from '@/components/layout/RootLayout'
import { RouteErrorBoundary } from '@/components/layout/RouteErrorBoundary'
import { leaveUserViewLoader } from './loaders'
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated'
import { RequireAuth } from './RequireAuth'
import { RequireCouchette } from './RequireCouchette'
import { RequireRole } from './RequireRole'

/** Page chargée à la demande (un fichier JS par page, comme les routes lazy du Vue). */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

/**
 * Mêmes chemins et mêmes gardes que src/router/index.ts du Vue (MIGRATION.md 5.1).
 * Les pages protégées sont sous AppLayout (navbar + dialogs globaux).
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    HydrateFallback: () => null,
    children: [
      // ── Pages publiques ─────────────────────────────────────────────────────
      { path: '/', lazy: page(() => import('@/pages/landing/LandingPage')) },
      {
        path: '/mentions-legales',
        lazy: page(() => import('@/pages/legal/MentionsLegalesPage')),
      },
      {
        path: '/politique-confidentialite',
        lazy: page(() => import('@/pages/legal/PolitiqueConfidentialitePage')),
      },
      { path: '/unauthorized', lazy: page(() => import('@/pages/common/UnauthorizedPage')) },
      { path: '/register/google', lazy: page(() => import('@/pages/auth/GoogleRegisterPage')) },
      { path: '/verify', lazy: page(() => import('@/pages/auth/VerifyPage')) },
      { path: '/forgot-password', lazy: page(() => import('@/pages/auth/ForgotPasswordPage')) },
      { path: '/password-reset', lazy: page(() => import('@/pages/auth/ResetPasswordPage')) },
      {
        path: '/download',
        lazy: page(() => import('@/pages/app-versions/AppVersionsPublicPage')),
      },

      // ── Connexion / inscription : un utilisateur connecté va sur sa route par défaut ──
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { path: '/login', lazy: page(() => import('@/pages/auth/LoginPage')) },
          { path: '/register', lazy: page(() => import('@/pages/auth/RegisterPage')) },
        ],
      },

      // ── Pages protégées (connecté + e-mail vérifié + compte actif) ─────────
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/add-to-homescreen',
                lazy: page(() => import('@/pages/auth/AddToHomescreenPage')),
              },
              { path: '/pointage', lazy: page(() => import('@/pages/hours/PointagePage')) },
              {
                path: '/myabsences',
                lazy: page(() => import('@/pages/myabsences/MyAbsencesPage')),
              },
              { path: '/myacomptes', lazy: page(() => import('@/pages/acomptes/MyAcomptesPage')) },
              {
                path: '/notifications',
                lazy: page(() => import('@/pages/common/NotificationsPage')),
              },
              { path: '/profile', lazy: page(() => import('@/pages/common/ProfilePage')) },
              {
                element: <RequireCouchette />,
                children: [
                  {
                    path: '/mycouchettes',
                    lazy: page(() => import('@/pages/couchettes/MesCouchettesPage')),
                  },
                ],
              },

              // ── Administrateur ─────────────────────────────────────────────
              {
                element: <RequireRole role="admin" />,
                loader: leaveUserViewLoader,
                shouldRevalidate: () => true,
                children: [
                  {
                    path: '/services',
                    lazy: page(() => import('@/pages/common/ServicesMonitoringPage')),
                  },
                  { path: '/users', lazy: page(() => import('@/pages/users/UsersPage')) },
                  // UserEdit.vue est cassée et orpheline dans le Vue (MIGRATION.md, Q-USEREDIT)
                  { path: '/users/:uuid', element: <Navigate to="/users" replace /> },
                  {
                    path: '/users/:uuid/services',
                    lazy: page(() => import('@/pages/users/UserServicesPage')),
                  },
                  { path: '/absences', lazy: page(() => import('@/pages/absences/AbsencesPage')) },
                  {
                    path: '/absence-types',
                    lazy: page(() => import('@/pages/absences/AbsenceTypesPage')),
                  },
                  { path: '/planning', lazy: page(() => import('@/pages/hours/PlanningPage')) },
                  { path: '/heures', lazy: page(() => import('@/pages/hours/HeuresPage')) },
                  {
                    path: '/export-hours',
                    lazy: page(() => import('@/pages/hours/ExportHoursPage')),
                  },
                  {
                    path: '/contract-hours',
                    lazy: page(() => import('@/pages/hours/ContractHoursPage')),
                  },
                  {
                    path: '/journal-pointages',
                    lazy: page(() => import('@/pages/hours/JournalPointagesPage')),
                  },
                  { path: '/acomptes', lazy: page(() => import('@/pages/acomptes/AcomptesPage')) },
                  {
                    path: '/signatures',
                    lazy: page(() => import('@/pages/signatures/SignaturesPage')),
                  },
                  {
                    path: '/couchettes',
                    lazy: page(() => import('@/pages/couchettes/CouchettesPage')),
                  },
                  { path: '/cartes', lazy: page(() => import('@/pages/cartes/CartesPage')) },
                  {
                    path: '/types-cartes',
                    lazy: page(() => import('@/pages/cartes/TypesCartesPage')),
                  },
                  {
                    path: '/app-versions',
                    lazy: page(() => import('@/pages/app-versions/AppVersionsPage')),
                  },
                ],
              },

              // ── Administrateur ou mécanicien ───────────────────────────────
              {
                element: <RequireRole role="mechanic" />,
                children: [
                  {
                    path: '/vehicules',
                    lazy: page(() => import('@/pages/vehicles/VehiculesPage')),
                  },
                  {
                    path: '/vehicules/:id',
                    lazy: page(() => import('@/pages/vehicles/VehiculeDetailPage')),
                  },
                  {
                    path: '/types-entretien',
                    lazy: page(() => import('@/pages/maintenance/TypesEntretienPage')),
                  },
                  {
                    path: '/entretiens',
                    lazy: page(() => import('@/pages/maintenance/EntretiensPage')),
                  },
                  {
                    path: '/entretiens/vehicule/:id',
                    lazy: page(() => import('@/pages/maintenance/EntretiensVehiculePage')),
                  },
                  { path: '/stock', lazy: page(() => import('@/pages/stock/StockItemsPage')) },
                  { path: '/todos', lazy: page(() => import('@/pages/todos/TodosPage')) },
                ],
              },
            ],
          },
        ],
      },

      // ── 404 (doit rester en dernier) ──────────────────────────────────────────
      { path: '*', lazy: page(() => import('@/pages/common/NotFoundPage')) },
    ],
  },
]

export const router = createBrowserRouter(routes)
