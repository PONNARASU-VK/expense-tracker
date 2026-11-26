from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

CATEGORIES = [(c, c) for c in [
    "Food", "Transport", "Rent", "Shopping", "Bills", "Health",
    "Entertainment", "Education", "Salary", "Other",
]]


class Transaction(models.Model):
    TYPES = [("income", "Income"), ("expense", "Expense")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name="transactions")
    type = models.CharField(max_length=7, choices=TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2,
                                 validators=[MinValueValidator(Decimal("0.01"))])
    category = models.CharField(max_length=20, choices=CATEGORIES)
    description = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f"{self.user} {self.type} {self.amount}"


class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name="budgets")
    month = models.DateField()  # always the 1st day of the month
    amount = models.DecimalField(max_digits=12, decimal_places=2,
                                 validators=[MinValueValidator(Decimal("0"))])

    class Meta:
        unique_together = ("user", "month")
