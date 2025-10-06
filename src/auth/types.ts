export type JwtPayload = {
  sub: string;         // userId
  email: string;
  role: 'SUPER_ADMIN'|'ADMIN'|'MANAGER'|'CASHIER'|'COOK'|'WAITER';
  tenantId?: string;
};
export type LoginResponse = {
  access_token: string;
  role: JwtPayload['role'];
  tenantId?: string;
  user: { id: string; name: string; email: string };
};