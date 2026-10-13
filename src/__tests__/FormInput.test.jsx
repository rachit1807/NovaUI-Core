import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormInput } from "../components/FormInput";
describe("FormInput", () => {
  test("connects its label to a generated input id", () => {
    render(<FormInput label="Email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("id");
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
  test("uses an explicit id and forwards input props", () => {
    render(
      <FormInput
        id="contact"
        label="Email"
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="wide"
      />,
    );
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("id", "contact");
    expect(screen.getByLabelText(/Email/)).toBeRequired();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Email/).parentElement).toHaveClass("wide");
  });
  test("accepts typing and dispatches changes", async () => {
    const onChange = jest.fn();
    render(<FormInput label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "Maya");
    expect(screen.getByLabelText("Name")).toHaveValue("Maya");
    expect(onChange).toHaveBeenCalledTimes(4);
  });
  test("associates the hint as an accessible description", () => {
    render(<FormInput label="Name" hint="Your full name" />);
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription(
      "Your full name",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  test("prioritizes and announces errors over hints", () => {
    render(<FormInput label="Email" error="Invalid email" hint="Work email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Invalid email",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
    expect(screen.queryByText("Work email")).not.toBeInTheDocument();
  });
  test("prevents editing a disabled field", async () => {
    render(<FormInput label="Name" defaultValue="Rachit" disabled />);
    await userEvent.type(screen.getByLabelText("Name"), "Extra");
    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.getByLabelText("Name")).toHaveValue("Rachit");
  });
  test("generates distinct ids for repeated labels", () => {
    render(
      <>
        <FormInput label="Name" />
        <FormInput label="Name" />
      </>,
    );
    const [first, second] = screen.getAllByLabelText("Name");
    expect(first.id).not.toBe(second.id);
  });
});
