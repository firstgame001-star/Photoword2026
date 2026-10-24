-- Trigger runs internally; no public RPC access.
REVOKE ALL ON FUNCTION public.apply_star_refund_debt_to_earnings() FROM PUBLIC, anon, authenticated;
