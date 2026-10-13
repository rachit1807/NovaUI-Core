import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserCard } from "../components/UserCard";
const user = {
  name: "Maya Shah",
  role: "Designer",
  email: "maya@example.com",
  initials: "MS",
  color: "rose",
  status: "Available",
};
describe("UserCard", () => {
  test("renders profile content and explicit initials", () => {
    render(<UserCard user={user} />);
    expect(
      screen.getByRole("article", { name: "Maya Shah profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Maya Shah" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByText("maya@example.com")).toBeInTheDocument();
    expect(screen.getByText("MS")).toHaveClass("avatar--rose");
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
  test("derives initials, color, and default status", () => {
    render(
      <UserCard
        user={{
          name: "Rachit Tripathi",
          role: "Developer",
          email: "rt@example.com",
        }}
      />,
    );
    expect(screen.getByText("RT")).toHaveClass("avatar--blue");
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
  test("indicates an away status", () => {
    render(<UserCard user={{ ...user, status: "Away" }} />);
    expect(screen.getByText("Away")).toHaveClass("is-away");
  });
  test("calls the save handler with the original user", async () => {
    const onSelect = jest.fn();
    render(<UserCard user={user} onSelect={onSelect} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Save Maya Shah" }),
    );
    expect(onSelect).toHaveBeenCalledWith(user);
  });
  test("announces the selected state and supports unsaving", async () => {
    const onSelect = jest.fn();
    render(<UserCard user={user} selected onSelect={onSelect} />);
    const save = screen.getByRole("button", { name: "Unsave Maya Shah" });
    expect(save).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(save);
    expect(onSelect).toHaveBeenCalledWith(user);
  });
  test("calls contact with the original user", async () => {
    const onContact = jest.fn();
    render(<UserCard user={user} onContact={onContact} />);
    await userEvent.click(screen.getByRole("button", { name: "Contact Maya" }));
    expect(onContact).toHaveBeenCalledWith(user);
  });
  test("omits details and contact in compact mode", () => {
    render(<UserCard user={user} compact />);
    expect(screen.queryByText("maya@example.com")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Contact Maya" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveClass("user-card--compact");
    expect(
      screen.getByRole("button", { name: "Save Maya Shah" }),
    ).toBeInTheDocument();
  });
  test("handles missing optional action callbacks", async () => {
    render(<UserCard user={user} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Save Maya Shah" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Contact Maya" }));
    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});
