import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
beforeEach(() => localStorage.clear());
describe("Component studio integration", () => {
  test("switches between light and dark themes and stores the preference", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    await user.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("novaui-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
  test("restores the saved theme on remount", () => {
    localStorage.setItem("novaui-theme", "dark");
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeInTheDocument();
  });
  test("falls back to light when the stored theme is invalid", () => {
    localStorage.setItem("novaui-theme", "invalid");
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
  test.each(["invalid JSON", "{}"])(
    "recovers from malformed saved-profile data: %s",
    (stored) => {
      localStorage.setItem("novaui-saved", stored);
      render(<App />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Good interfaces start here",
      );
    },
  );
  test("switches component tabs with arrow keys and keeps the active tab focused", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Buttons", exact: true }),
    );
    await user.click(screen.getByRole("tab", { name: "Playground" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Code" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Test cases" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Playground" })).toHaveFocus();
  });
  test("opens a component through filtered search and displays an empty search state", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("textbox", { name: "Find a component" });
    await user.type(search, "nonexistent");
    expect(screen.getByText("No components found")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    await user.type(search, "user");
    await user.click(screen.getByRole("button", { name: "Explore User Card" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "User Card",
    );
  });
  test("updates button props, logs events, and disables interaction", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Buttons", exact: true }),
    );
    const label = screen.getByLabelText("Button label");
    await user.clear(label);
    await user.type(label, "Launch");
    await user.click(screen.getByRole("button", { name: "Launch" }));
    expect(
      screen.getByText("Button clicked — onClick event fired.", {
        selector: ".event-row span",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: /Disabled/ }));
    expect(screen.getByRole("button", { name: "Launch" })).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Reset component properties" }),
    );
    expect(
      screen.getByRole("button", { name: "Get started", exact: true }),
    ).toBeEnabled();
  });
  test("keeps saved cards across remounts and supports unsaving", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(
      screen.getByRole("button", { name: "User cards", exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "Save Maya Shah" }));
    expect(JSON.parse(localStorage.getItem("novaui-saved"))).toEqual([2]);
    first.unmount();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "User cards", exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "Saved (1)" }));
    expect(
      screen.getByRole("article", { name: "Maya Shah profile" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("article", { name: "Rachit Tripathi profile" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Unsave Maya Shah" }));
    expect(screen.getByText("Your shortlist starts here.")).toBeInTheDocument();
  });
  test("shows contact details in a keyboard-dismissable dialog and restores focus", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "User cards", exact: true }),
    );
    const trigger = screen.getByRole("button", { name: "Contact Maya" });
    await user.click(trigger);
    expect(
      within(screen.getByRole("dialog")).getByText("maya@example.com"),
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  test("validates and successfully submits the live login form", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Login form", exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    await user.type(screen.getByLabelText(/Email address/), "demo@example.com");
    await user.type(
      screen.getByLabelText("Password", { exact: false, selector: "input" }),
      "sample123",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("You're all set.")).toBeInTheDocument();
    expect(
      screen.getByText("Form submitted successfully for demo@example.com.", {
        selector: ".event-row span",
      }),
    ).toBeInTheDocument();
  });
  test("opens code, test behavior, test reports, and documentation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Buttons", exact: true }),
    );
    await user.click(screen.getByRole("tab", { name: "Code" }));
    expect(screen.getByText(/onClick=\{handleClick\}/)).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Test cases" }));
    expect(
      screen.getByText("Prevents actions when disabled or loading"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Test reports", exact: true }),
    );
    expect(
      screen.getByRole("heading", { name: "Component coverage" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Test commands" }));
    expect(
      screen.getByRole("heading", { name: "01 · Start the studio" }),
    ).toBeInTheDocument();
  });
});
