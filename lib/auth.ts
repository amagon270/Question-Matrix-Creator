import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient, users } from "@prisma/client";

export const hashPassword = (
  password: string,
  saltRounds: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });
};

export const doesPasswordMatchHash = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

export const userToJWT = (
  user: users,
): string => {
  return signJWT({
    userId: user.id,
    username: user.username,
  });
};

export const getAuthHeader = (headers): string | undefined => {
  const authHeader = headers.authorization;
  if (authHeader) {
    const split = authHeader && authHeader.split && authHeader.split("Bearer ");
    return split && split[1];
  } else {
    return undefined;
  }
};

export const signJWT = (payload: Omit<auth.DecodedAuthToken, "exp">): string => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRE_HOURS) * 60 * 60,
  });
};

export const decodeJWT = async (
  token: string,
): Promise<auth.DecodedAuthToken | undefined> => {
  if (!token) {
    return undefined;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as auth.DecodedAuthToken;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const checkAuth = async (req, res) => {
  const authToken = getAuthHeader(req.headers);
  if (authToken) {
    const prisma = new PrismaClient();
    const decodedToken = await decodeJWT(authToken);
    const _user = await prisma.users.findFirst({
      where: {
        id: decodedToken.userId
      }
    });
    await prisma.$disconnect();
    if (_user) {
      return _user;
    }
  } else {
    res.status(400).json({text: "Something went wrong.  Sign in again"});
  }
};