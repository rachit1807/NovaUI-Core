import { validateLogin } from "../lib/validation";
describe("login validation", () => {
  test("requires both fields", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Enter your email address.",
      password: "Enter your password.",
    });
  });
  test("treats whitespace as an empty email", () => {
    expect(validateLogin({ email: "   ", password: "sample123" })).toEqual({
      email: "Enter your email address.",
    });
  });
  test.each(["person", "person@", "person@example", "bad name@example.com"])(
    "rejects invalid email %s",
    (email) => {
      expect(validateLogin({ email, password: "sample123" })).toHaveProperty(
        "email",
        "Enter a valid email address.",
      );
    },
  );
  test("rejects a seven-character password", () => {
    expect(
      validateLogin({ email: "test@example.com", password: "1234567" }),
    ).toEqual({ password: "Use at least 8 characters." });
  });
  test("accepts an eight-character password and trims email whitespace", () => {
    expect(
      validateLogin({ email: " test@example.com ", password: "12345678" }),
    ).toEqual({});
  });
});
