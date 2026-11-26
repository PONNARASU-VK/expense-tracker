from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from .views import BudgetView, LogoutView, RegisterView, SummaryView, TransactionViewSet

router = DefaultRouter()
router.register("transactions", TransactionViewSet, basename="transaction")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", obtain_auth_token),
    path("auth/logout/", LogoutView.as_view()),
    path("summary/", SummaryView.as_view()),
    path("budget/", BudgetView.as_view()),
    path("", include(router.urls)),
]
