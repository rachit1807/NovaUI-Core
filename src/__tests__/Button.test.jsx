import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/Button";
describe("Button", () => {
  test("renders a native button with safe defaults", () => {
    render(<Button>Get started</Button>);
    expect(screen.getByRole("button", { name: "Get started" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(screen.getByRole("button")).toHaveClass(
      "button--primary",
      "button--md",
    );
  });
  test.each(["primary", "secondary", "ghost", "danger"])(
    "renders the %s variant",
    (variant) => {
      render(<Button variant={variant}>Action</Button>);
      expect(screen.getByRole("button")).toHaveClass(`button--${variant}`);
    },
  );
  test.each(["sm", "md", "lg"])("renders the %s size", (size) => {
    render(<Button size={size}>Action</Button>);
    expect(screen.getByRole("button")).toHaveClass(`button--${size}`);
  });
  test("forwards props, class names, and submit type", () => {
    render(
      <Button
        type="submit"
        className="custom"
        aria-label="Save changes"
        data-testid="save"
      >
        Save
      </Button>,
    );
    expect(screen.getByTestId("save")).toHaveClass("custom");
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toHaveAttribute("type", "submit");
  });
  test("calls the handler on click", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Action</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  test("supports keyboard activation", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Action</Button>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  test("does not dispatch clicks while disabled", async () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Action
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
  test("announces loading and prevents interaction", async () => {
    const onClick = jest.fn();
    render(
      <Button loading icon={<span>Arrow</span>} onClick={onClick}>
        Saving
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(screen.queryByText("Arrow")).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
  test("renders a decorative icon without changing the accessible name", () => {
    render(<Button icon={<span>Icon</span>}>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByText("Icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
