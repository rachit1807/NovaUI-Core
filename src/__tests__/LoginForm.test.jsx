import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../components/LoginForm";
async function fillForm(
  user,
  email = "demo@example.com",
  password = "sample123",
) {
  await user.type(screen.getByLabelText(/Email address/), email);
  await user.type(
    screen.getByLabelText("Password", { exact: false, selector: "input" }),
    password,
  );
}
describe("LoginForm", () => {
  test("renders labeled fields and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email address/)).toBeRequired();
    expect(
      screen.getByLabelText("Password", { exact: false, selector: "input" }),
    ).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
  test("shows required errors and blocks an empty submission", async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });
  test("rejects invalid email and a short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillForm(user, "invalid", "short");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
  });
  test("clears field feedback when the user edits it", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(screen.getByLabelText(/Email address/), "a");
    expect(
      screen.queryByText("Enter your email address."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
  });
  test("reveals and hides a password without submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(
      screen.getByLabelText("Password", { exact: false, selector: "input" }),
    ).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(
      screen.getByLabelText("Password", { exact: false, selector: "input" }),
    ).toHaveAttribute("type", "password");
    expect(onSubmit).not.toHaveBeenCalled();
  });
  test("submits a trimmed email and remember preference without exposing the password", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    await fillForm(user, " demo@example.com ");
    await user.click(screen.getByLabelText("Remember this demo preference"));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      email: "demo@example.com",
      remember: true,
    });
    expect(screen.getByRole("status")).toHaveTextContent("You're all set.");
    expect(screen.queryByLabelText(/Email address/)).not.toBeInTheDocument();
  });
  test("resets successful submission, values, checkbox, and visibility", async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();
    render(<LoginForm onReset={onReset} />);
    await fillForm(user);
    await user.click(screen.getByLabelText("Remember this demo preference"));
    await user.click(screen.getByRole("button", { name: "Show password" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByLabelText(/Email address/)).toHaveValue("");
    expect(
      screen.getByLabelText("Password", { exact: false, selector: "input" }),
    ).toHaveValue("");
    expect(
      screen.getByLabelText("Password", { exact: false, selector: "input" }),
    ).toHaveAttribute("type", "password");
    expect(
      screen.getByLabelText("Remember this demo preference"),
    ).not.toBeChecked();
    expect(onReset).toHaveBeenCalledTimes(1);
  });
  test("works without optional callbacks and supports Enter to submit", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillForm(user);
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("You're all set.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeInTheDocument();
  });
});
