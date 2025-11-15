"""User financial summary materialized view"""

from alembic import op

revision = "20241115_0002"
down_revision = "20241115_0001"
branch_labels = None
depends_on = None

VIEW_SQL = (
    "SELECT "
    " owner_id AS user_id,"
    " COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,"
    " COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense,"
    " COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance,"
    " COUNT(*) AS transaction_count,"
    " MAX(date) AS last_transaction_at"
    " FROM transactions"
    " GROUP BY owner_id"
)


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else "postgresql"

    if dialect in ("postgresql", "postgres"):
        op.execute("DROP MATERIALIZED VIEW IF EXISTS user_financial_summary_mv")
        op.execute(f"CREATE MATERIALIZED VIEW user_financial_summary_mv AS {VIEW_SQL}")
        op.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS user_financial_summary_mv_user_id_idx "
            "ON user_financial_summary_mv (user_id)"
        )
    else:
        op.execute("DROP VIEW IF EXISTS user_financial_summary_mv")
        op.execute(f"CREATE VIEW user_financial_summary_mv AS {VIEW_SQL}")


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else "postgresql"

    if dialect in ("postgresql", "postgres"):
        op.execute("DROP MATERIALIZED VIEW IF EXISTS user_financial_summary_mv")
        op.execute("DROP INDEX IF EXISTS user_financial_summary_mv_user_id_idx")
    else:
        op.execute("DROP VIEW IF EXISTS user_financial_summary_mv")
