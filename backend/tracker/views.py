from datetime import date

from django.db.models import Q, Sum
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Transaction
from .serializers import RegisterSerializer, TransactionSerializer


def parse_month(value):
    """'2025-03' -> date(2025, 3, 1). Falls back to the current month."""
    try:
        year, month = map(int, value.split("-"))
        return date(year, month, 1)
    except (ValueError, AttributeError):
        today = date.today()
        return date(today.year, today.month, 1)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key}, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TransactionViewSet(viewsets.ModelViewSet):
    """Full CRUD + search/filter. Users can only ever see their own rows."""
    serializer_class = TransactionSerializer

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user)
        p = self.request.query_params
        if p.get("search"):
            qs = qs.filter(Q(description__icontains=p["search"]) | Q(category__icontains=p["search"]))
        if p.get("type") in ("income", "expense"):
            qs = qs.filter(type=p["type"])
        if p.get("category"):
            qs = qs.filter(category=p["category"])
        if p.get("month"):
            m = parse_month(p["month"])
            qs = qs.filter(date__year=m.year, date__month=m.month)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SummaryView(APIView):
    def get(self, request):
        m = parse_month(request.query_params.get("month"))
        qs = Transaction.objects.filter(user=request.user, date__year=m.year, date__month=m.month)
        total = lambda t: float(qs.filter(type=t).aggregate(s=Sum("amount"))["s"] or 0)
        income, expense = total("income"), total("expense")
        by_category = [
            {"category": r["category"], "total": float(r["total"])}
            for r in qs.filter(type="expense").values("category")
                       .annotate(total=Sum("amount")).order_by("-total")
        ]
        budget = Budget.objects.filter(user=request.user, month=m).first()
        return Response({
            "income": income, "expense": expense, "balance": income - expense,
            "budget": float(budget.amount) if budget else 0,
            "by_category": by_category,
        })


class BudgetView(APIView):
    def put(self, request):
        m = parse_month(request.data.get("month"))
        try:
            amount = float(request.data.get("amount"))
            if amount < 0 or amount > 1e10:
                raise ValueError
        except (TypeError, ValueError):
            return Response({"amount": ["Enter a valid amount."]}, status=400)
        Budget.objects.update_or_create(user=request.user, month=m, defaults={"amount": amount})
        return Response({"month": m.strftime("%Y-%m"), "amount": amount})
