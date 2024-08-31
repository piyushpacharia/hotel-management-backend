import jwt from "jsonwebtoken";
class JWTService {
  static sign(payload, expiry = "30d", secret = process.env.JWT_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  // static mailSign(payload, expiry = "1h", secret = process.env.JWT_MAILSECRET) {
  //   return jwt.sign(payload, secret, { expiresIn: expiry });
  // }

  static verify(token, secret = process.env.JWT_SECRET) {
    return jwt.verify(token, secret);
  }
}
export default JWTService;