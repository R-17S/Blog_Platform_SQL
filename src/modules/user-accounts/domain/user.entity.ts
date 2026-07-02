export type UserSqlEntity = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode: string | null;
  confirmationExpiration: string | null;
  isConfirmed: boolean;
  recoveryCode: string | null;
  recoveryExpiration: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};
