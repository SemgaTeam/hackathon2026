import bcrypt from "bcrypt";

export const hashedPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltRounds);
  return hashPassword;
};
