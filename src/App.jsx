import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Code2,
  Command,
  FlaskConical,
  LayoutGrid,
  Mail,
  MousePointer2,
  Moon,
  PanelTop,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Terminal,
  TextCursorInput,
  Users,
  X,
} from "lucide-react";
import { Button } from "./components/Button";
import { FormInput } from "./components/FormInput";
import { LoginForm } from "./components/LoginForm";
import { UserCard } from "./components/UserCard";
import { catalog, members } from "./data/catalog";
import report from "./data/testReport.json";

const icons = {
  buttons: MousePointer2,
  inputs: TextCursorInput,
  login: PanelTop,
  cards: Users,
};
const defaults = {
  variant: "primary",
  size: "md",
  label: "Get started",
  disabled: false,
  loading: false,
  compact: false,
  inputState: "default",
};
function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem("novaui-saved") || "[]");
    return Array.isArray(value)
      ? value.filter((id) => members.some((user) => user.id === id))
      : [];
  } catch {
    return [];
  }
}
function CodeBlock({ children }) {
  return (
    <pre className="code-block">
      <code>{children}</code>
    </pre>
  );
}
function readTheme() {
  try {
    return localStorage.getItem("novaui-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
export default function App() {
  const [theme, setTheme] = useState(readTheme);
  const [page, setPage] = useState("overview");
  const [selected, setSelected] = useState("buttons");
  const [tab, setTab] = useState("preview");
  const [query, setQuery] = useState("");
  const [config, setConfig] = useState(defaults);
  const [inputValue, setInputValue] = useState("");
  const [saved, setSaved] = useState(readSaved);
  const [toast, setToast] = useState("");
  const [events, setEvents] = useState([]);
  const [contact, setContact] = useState(null);
  const [cardFilter, setCardFilter] = useState("all");
  const [formKey, setFormKey] = useState(0);
  const searchRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const component = catalog.find((item) => item.id === selected);
  const Icon = icons[selected];
  const coverage = report.coverage?.lines ?? 0;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101521" : "#f7f8fa");
    try {
      localStorage.setItem("novaui-theme", theme);
    } catch {
      /* The toggle remains available when browser storage is disabled. */
    }
  }, [theme]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    try {
      localStorage.setItem("novaui-saved", JSON.stringify(saved));
    } catch {
      /* Saved cards still work for this session when storage is unavailable. */
    }
  }, [saved]);
  useEffect(() => {
    function shortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (contact) {
      lastFocus.current = document.activeElement;
      closeRef.current?.focus();
    } else {
      lastFocus.current?.focus();
    }
  }, [contact]);
  function notify(message) {
    setToast(message);
  }
  function log(message) {
    setEvents((current) =>
      [
        {
          message,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        },
        ...current,
      ].slice(0, 6),
    );
    notify(message);
  }
  function openComponent(id) {
    setSelected(id);
    setPage("components");
    setTab("preview");
    setQuery("");
  }
  function update(key, value) {
    setConfig((current) => ({ ...current, [key]: value }));
  }
  function toggleSave(user) {
    setSaved((current) =>
      current.includes(user.id)
        ? current.filter((id) => id !== user.id)
        : [...current, user.id],
    );
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copied to clipboard.");
    } catch {
      notify("Clipboard unavailable. Select and copy the code below.");
    }
  }
  function exportConfig() {
    const props =
      selected === "buttons"
        ? {
            label: config.label,
            variant: config.variant,
            size: config.size,
            disabled: config.disabled,
            loading: config.loading,
          }
        : selected === "inputs"
          ? { disabled: config.disabled, feedback: config.inputState }
          : selected === "cards"
            ? { compact: config.compact }
            : { validation: "email and password with at least 8 characters" };
    const blob = new Blob(
      [JSON.stringify({ component: component.name, props }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "novaui-component.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Component configuration exported.");
  }
  const shown = catalog.filter((item) =>
    `${item.name} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const isStudio = page === "components";
  const source =
    selected === "buttons"
      ? `<Button\n  variant="${config.variant}"\n  size="${config.size}"\n  disabled={${config.disabled}}\n  loading={${config.loading}}\n  onClick={handleClick}\n>\n  {${JSON.stringify(config.label || "Button")}}\n</Button>`
      : component.source;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => setPage("overview")}
          aria-label="NovaUI Core home"
        >
          <span className="brand-mark">N</span>
          <span>
            NovaUI<span className="brand-core">CORE</span>
          </span>
        </button>
        <div className="workspace-badge">
          <span className="workspace-icon">
            <Boxes size={18} />
          </span>
          <div>
            Component studio<small>Personal workspace</small>
          </div>
          <span className="version">v1.0</span>
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav aria-label="Workspace navigation">
          {[
            ["overview", "Overview", LayoutGrid],
            ["components", "Components", Boxes],
            ["testing", "Test reports", FlaskConical],
            ["docs", "Documentation", BookOpen],
          ].map(([id, label, NavIcon]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => {
                setPage(id);
                setQuery("");
              }}
              aria-current={page === id ? "page" : undefined}
            >
              <NavIcon size={18} />
              {label}
              {id === "components" && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <span className="nav-caption component-caption">COMPONENT LIBRARY</span>
        <nav aria-label="Component navigation">
          {catalog.map((item) => {
            const ItemIcon = icons[item.id];
            return (
              <button
                key={item.id}
                className={`nav-item sub-item ${isStudio && selected === item.id ? "sub-active" : ""}`}
                onClick={() => openComponent(item.id)}
              >
                <ItemIcon size={17} />
                {item.label}
                <span className="nav-dot" />
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="quality-note">
            <ShieldCheck size={21} />
            <strong>Made to be dependable.</strong>
            <p>
              Accessible by design.
              <br />
              Tested for the details.
            </p>
            <button onClick={() => setPage("testing")}>
              Explore the tests <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="help-link" onClick={() => setPage("docs")}>
            <CircleHelp size={16} />
            Quick start guide <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-profile">
            <span className="profile-avatar">RT</span>
            <div>
              Rachit Tripathi<small>Frontend developer</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <span>
              {isStudio
                ? component.name
                : {
                    overview: "Overview",
                    testing: "Test reports",
                    docs: "Documentation",
                  }[page]}
            </span>
          </div>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              aria-pressed={theme === "dark"}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
              <span>{theme === "light" ? "Light" : "Dark"} theme</span>
            </button>
            <span className="header-divider" />
            <span className="top-version">v1.0.0</span>
            <span className="profile-avatar small">RT</span>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "overview"
                  ? "YOUR BUILDING BLOCKS"
                  : page === "testing"
                    ? "QUALITY, MEASURED"
                    : page === "docs"
                      ? "GET UP AND RUNNING"
                      : `${component.category.toUpperCase()} / ${component.name.toUpperCase()}`}
              </div>
              <h1>
                {page === "overview"
                  ? "Good interfaces start here"
                  : page === "testing"
                    ? "Confidence in every component"
                    : page === "docs"
                      ? "A small library. A solid foundation"
                      : component.name}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {page === "overview"
                  ? "Explore, customize, and test the essentials. Make them your own."
                  : page === "testing"
                    ? "Real Jest results, generated from the included test suite."
                    : page === "docs"
                      ? "Everything you need to build, run, and test NovaUI Core."
                      : component.description}
              </p>
            </div>
            <Button
              variant="secondary"
              icon={
                page === "testing" ? (
                  <Terminal size={16} />
                ) : (
                  <BookOpen size={16} />
                )
              }
              onClick={() => {
                if (page === "testing") {
                  setPage("docs");
                } else {
                  setPage(page === "docs" ? "components" : "docs");
                }
              }}
            >
              {page === "testing"
                ? "Test commands"
                : page === "docs"
                  ? "Open studio"
                  : "View documentation"}
              <ArrowUpRight size={14} />
            </Button>
          </div>

          {page === "overview" && (
            <>
              <section className="intro-banner">
                <div className="banner-copy">
                  <span className="banner-tag">
                    <span />
                    READY FOR YOUR NEXT IDEA
                  </span>
                  <h2>
                    The essentials, with
                    <br />
                    the details taken care of.
                  </h2>
                  <p>
                    Four reusable components. Real interactions.
                    <br />A testing setup you can trust.
                  </p>
                  <Button onClick={() => openComponent("buttons")}>
                    Open playground <ArrowRight size={16} />
                  </Button>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <div className="art-grid" />
                  <div className="art-window">
                    <div className="art-window-top">
                      <i />
                      <i />
                      <i />
                      <span>component.preview</span>
                    </div>
                    <div className="art-body">
                      <span className="art-avatar">N</span>
                      <div className="art-lines">
                        <i />
                        <i />
                      </div>
                      <div className="art-input">
                        Your next great interface <TextCursorInput size={13} />
                      </div>
                      <div className="art-action">
                        Let’s build something <ArrowRight size={15} />
                      </div>
                      <span className="art-check">
                        <CheckCircle2 size={13} />
                        All checks passed
                      </span>
                    </div>
                  </div>
                  <div className="floating-code">
                    <Braces size={22} />
                  </div>
                  <div className="floating-check">
                    <Check size={20} />
                  </div>
                </div>
              </section>
              <section className="stats-grid" aria-label="Project statistics">
                {[
                  [Boxes, "Components", "04", "A focused set of essentials"],
                  [
                    FlaskConical,
                    "Tests passing",
                    `${report.passed}/${report.tests}`,
                    `${report.suites} suites · Jest + Testing Library`,
                  ],
                  [
                    ShieldCheck,
                    "Line coverage",
                    `${coverage}%`,
                    "Generated from the test suite",
                  ],
                ].map(([StatIcon, label, value, caption]) => (
                  <div className="stat-card" key={label}>
                    <div className="stat-label">
                      <StatIcon size={17} />
                      {label}
                      <ArrowUpRight size={14} />
                    </div>
                    <div className="stat-value">
                      {value}
                      {label !== "Components" && (
                        <span className="stat-success">
                          <Check size={13} />
                          {label === "Line coverage" ? "Measured" : "Passing"}
                        </span>
                      )}
                    </div>
                    <p>{caption}</p>
                  </div>
                ))}
              </section>
              <section className="library-section">
                <div className="section-top">
                  <div>
                    <h2>
                      Meet your components <span>04</span>
                    </h2>
                    <p>Designed to work together. Ready to play with.</p>
                  </div>
                  <label className="search-box">
                    <Search size={17} />
                    <input
                      ref={searchRef}
                      placeholder="Find a component…"
                      aria-label="Find a component"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd>
                      <Command size={10} />K
                    </kbd>
                  </label>
                </div>
                <div className="component-grid">
                  {shown.map((item) => {
                    const TileIcon = icons[item.id];
                    return (
                      <button
                        className="component-tile"
                        aria-label={`Explore ${item.name}`}
                        key={item.id}
                        onClick={() => openComponent(item.id)}
                      >
                        <div
                          className={`tile-preview tile-preview--${item.id}`}
                        >
                          {item.id === "buttons" ? (
                            <>
                              <span className="fake-button">
                                Get started <ArrowRight size={13} />
                              </span>
                              <span className="fake-button secondary">
                                Learn more
                              </span>
                            </>
                          ) : item.id === "inputs" ? (
                            <div className="fake-field">
                              <span>Email address</span>
                              <div>
                                hello@novaui.dev <CheckCircle2 size={14} />
                              </div>
                            </div>
                          ) : item.id === "login" ? (
                            <div className="fake-form">
                              <i />
                              <i />
                              <span>
                                Continue <ArrowRight size={12} />
                              </span>
                            </div>
                          ) : (
                            <div className="fake-user">
                              <span>MS</span>
                              <div>
                                <strong>Maya Shah</strong>
                                <small>Product designer</small>
                                <em>
                                  <i />
                                  Available
                                </em>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="tile-copy">
                          <span className="tile-icon">
                            <TileIcon size={17} />
                          </span>
                          <div>
                            <h3>{item.name}</h3>
                            <p>{item.category} · Interactive</p>
                          </div>
                          <ArrowUpRight size={16} />
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!shown.length && (
                  <div className="empty-state">
                    <Search size={24} />
                    <h3>No components found</h3>
                    <p>Try “button”, “form”, or “card”.</p>
                    <Button variant="secondary" onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  </div>
                )}
              </section>
              <div className="overview-footer">
                <div>
                  <span className="tiny-icon">
                    <Code2 size={18} />
                  </span>
                  <div>
                    <strong>Built to be explored.</strong>
                    <p>Change a prop. Click a button. See what happens.</p>
                  </div>
                </div>
                <button onClick={() => setPage("testing")}>
                  Take a look under the hood <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {isStudio && (
            <>
              <div className="studio-layout">
                <section className="studio-panel">
                  <div className="studio-toolbar">
                    <div
                      className="tabs"
                      role="tablist"
                      aria-label="Component view"
                    >
                      {[
                        ["preview", "Playground", Play],
                        ["source", "Code", Code2],
                        ["tests", "Test cases", FlaskConical],
                      ].map(([id, label, TabIcon]) => (
                        <button
                          role="tab"
                          id={`tab-${id}`}
                          tabIndex={tab === id ? 0 : -1}
                          onKeyDown={(event) => {
                            const ids = ["preview", "source", "tests"];
                            const index = ids.indexOf(id);
                            const next =
                              event.key === "ArrowRight"
                                ? ids[(index + 1) % 3]
                                : event.key === "ArrowLeft"
                                  ? ids[(index + 2) % 3]
                                  : event.key === "Home"
                                    ? ids[0]
                                    : event.key === "End"
                                      ? ids[2]
                                      : null;
                            if (next) {
                              event.preventDefault();
                              setTab(next);
                              event.currentTarget.parentElement
                                .querySelector(`#tab-${next}`)
                                ?.focus();
                            }
                          }}
                          aria-selected={tab === id}
                          aria-controls="component-panel"
                          key={id}
                          onClick={() => setTab(id)}
                          className={tab === id ? "selected" : ""}
                        >
                          <TabIcon size={15} />
                          {label}
                        </button>
                      ))}
                    </div>
                    <span className="component-status">
                      <i />
                      Interactive
                    </span>
                  </div>
                  <div
                    id="component-panel"
                    role="tabpanel"
                    aria-labelledby={`tab-${tab}`}
                    tabIndex={0}
                  >
                    {tab === "preview" && (
                      <>
                        <div className={`playground playground--${selected}`}>
                          {selected === "buttons" && (
                            <div className="button-stage">
                              <span className="stage-caption">
                                YOUR COMPONENT, LIVE
                              </span>
                              <Button
                                variant={config.variant}
                                size={config.size}
                                disabled={config.disabled}
                                loading={config.loading}
                                icon={<ArrowRight size={16} />}
                                onClick={() =>
                                  log("Button clicked — onClick event fired.")
                                }
                              >
                                {config.label || "Button"}
                              </Button>
                              <p>Click the button to see its event below.</p>
                            </div>
                          )}
                          {selected === "inputs" && (
                            <div className="input-stage">
                              <FormInput
                                label="Email address"
                                placeholder="you@example.com"
                                type="email"
                                value={inputValue}
                                onChange={(e) => {
                                  setInputValue(e.target.value);
                                }}
                                disabled={config.disabled}
                                required
                                error={
                                  config.inputState === "error"
                                    ? "Please enter a valid email address."
                                    : undefined
                                }
                                hint={
                                  config.inputState === "hint"
                                    ? "We’ll only use this to contact you."
                                    : undefined
                                }
                              />
                              <p className="input-counter">
                                {inputValue.length} characters entered
                              </p>
                            </div>
                          )}
                          {selected === "login" && (
                            <LoginForm
                              key={formKey}
                              onSubmit={({ email }) =>
                                log(`Form submitted successfully for ${email}.`)
                              }
                            />
                          )}
                          {selected === "cards" && (
                            <div className="cards-stage">
                              <div className="card-filter">
                                <button
                                  className={
                                    cardFilter === "all" ? "selected" : ""
                                  }
                                  onClick={() => setCardFilter("all")}
                                >
                                  All members
                                </button>
                                <button
                                  className={
                                    cardFilter === "saved" ? "selected" : ""
                                  }
                                  onClick={() => setCardFilter("saved")}
                                >
                                  <Star size={13} />
                                  Saved ({saved.length})
                                </button>
                              </div>
                              <div className="user-grid">
                                {members
                                  .filter(
                                    (user) =>
                                      cardFilter === "all" ||
                                      saved.includes(user.id),
                                  )
                                  .map((user) => (
                                    <UserCard
                                      key={user.id}
                                      user={user}
                                      compact={config.compact}
                                      selected={saved.includes(user.id)}
                                      onSelect={toggleSave}
                                      onContact={setContact}
                                    />
                                  ))}
                              </div>
                              {cardFilter === "saved" && !saved.length && (
                                <div className="empty-state">
                                  <Star size={24} />
                                  <h3>Your shortlist starts here.</h3>
                                  <p>
                                    Save a member with the star on their card.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="preview-caption">
                          <span>
                            <Icon size={14} />
                            {component.name} / live preview
                          </span>
                          <span>
                            React · Accessible ·{" "}
                            {theme === "light" ? "Light" : "Dark"} theme
                          </span>
                        </div>
                      </>
                    )}
                    {tab === "source" && (
                      <div className="source-panel">
                        <div className="source-title">
                          <span>
                            Usage example <small>JSX</small>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Clipboard size={14} />}
                            onClick={() => copy(source)}
                          >
                            Copy code
                          </Button>
                        </div>
                        <CodeBlock>{source}</CodeBlock>
                        <div className="source-note">
                          <BookOpen size={16} />
                          <p>
                            Full implementation:{" "}
                            <code>
                              src/components/
                              {selected === "buttons"
                                ? "Button"
                                : selected === "inputs"
                                  ? "FormInput"
                                  : selected === "login"
                                    ? "LoginForm"
                                    : "UserCard"}
                              .jsx
                            </code>
                          </p>
                        </div>
                      </div>
                    )}
                    {tab === "tests" && (
                      <div className="cases-panel">
                        <span className="label-pill">BEHAVIOR CHECKLIST</span>
                        <h2>Test the details that matter.</h2>
                        <p>
                          These behaviors are covered by automated tests in the
                          project.
                        </p>
                        {component.tests.map((test, index) => (
                          <div className="test-case" key={test}>
                            <CheckCircle2 size={18} />
                            <span>{test}</span>
                            <span className="case-index">0{index + 1}</span>
                          </div>
                        ))}
                        <div className="command-strip">
                          <Terminal size={16} />
                          <code>npm run test:coverage</code>
                          <button
                            aria-label="Copy coverage command"
                            onClick={() => copy("npm run test:coverage")}
                          >
                            <Clipboard size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                <aside className="properties-panel">
                  <div className="properties-heading">
                    <SlidersHorizontal size={17} />
                    <h2>Properties</h2>
                    <button
                      aria-label="Reset component properties"
                      onClick={() => {
                        setConfig(defaults);
                        setInputValue("");
                        setFormKey((key) => key + 1);
                        notify("Component reset to defaults.");
                      }}
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                  <p className="properties-description">
                    A few tweaks. A different feel.
                  </p>
                  {selected === "buttons" && (
                    <>
                      <label className="control-label">
                        Button label
                        <input
                          value={config.label}
                          maxLength={40}
                          onChange={(e) => update("label", e.target.value)}
                        />
                      </label>
                      <fieldset className="property-field">
                        <legend>Variant</legend>
                        <div className="variant-options">
                          {["primary", "secondary", "ghost", "danger"].map(
                            (value) => (
                              <button
                                key={value}
                                className={
                                  config.variant === value ? "selected" : ""
                                }
                                aria-pressed={config.variant === value}
                                onClick={() => update("variant", value)}
                              >
                                <span className={`variant-dot ${value}`} />
                                {value}
                                <Check size={14} />
                              </button>
                            ),
                          )}
                        </div>
                      </fieldset>
                      <fieldset className="property-field">
                        <legend>Size</legend>
                        <div className="segmented">
                          {[
                            ["sm", "Small"],
                            ["md", "Medium"],
                            ["lg", "Large"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              className={
                                config.size === value ? "selected" : ""
                              }
                              aria-pressed={config.size === value}
                              onClick={() => update("size", value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  )}
                  {selected === "inputs" && (
                    <fieldset className="property-field">
                      <legend>Feedback</legend>
                      <div className="variant-options">
                        {["default", "hint", "error"].map((value) => (
                          <button
                            key={value}
                            className={
                              config.inputState === value ? "selected" : ""
                            }
                            aria-pressed={config.inputState === value}
                            onClick={() => update("inputState", value)}
                          >
                            {value}
                            <Check size={14} />
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {["buttons", "inputs"].includes(selected) && (
                    <label className="toggle-row">
                      <span>
                        Disabled<small>Prevent user interaction</small>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={config.disabled}
                        onChange={(e) => update("disabled", e.target.checked)}
                      />
                    </label>
                  )}
                  {selected === "buttons" && (
                    <label className="toggle-row">
                      <span>
                        Loading<small>Show a pending state</small>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={config.loading}
                        onChange={(e) => update("loading", e.target.checked)}
                      />
                    </label>
                  )}
                  {selected === "cards" && (
                    <label className="toggle-row">
                      <span>
                        Compact layout<small>Keep just the essentials</small>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={config.compact}
                        onChange={(e) => update("compact", e.target.checked)}
                      />
                    </label>
                  )}
                  {selected === "login" && (
                    <div className="form-guidance">
                      <ShieldCheck size={22} />
                      <h3>Try the edge cases.</h3>
                      <p>
                        Submit an empty form, use an invalid email, or try a
                        short password. Then fill in valid sample details.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setFormKey((key) => key + 1)}
                        icon={<RotateCcw size={14} />}
                      >
                        Reset form
                      </Button>
                    </div>
                  )}
                  <div className="property-tip">
                    <Sparkles size={16} />
                    <p>
                      Use the Code tab to see how this component fits into your
                      app.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="full-width"
                    size="sm"
                    icon={<ArrowDownToLine size={14} />}
                    onClick={exportConfig}
                  >
                    Export configuration
                  </Button>
                </aside>
              </div>
              <section className="event-panel">
                <div className="section-top">
                  <h2>
                    <Terminal size={16} />
                    Event activity <span>{events.length}</span>
                  </h2>
                  <button className="text-button" onClick={() => setEvents([])}>
                    Clear activity
                  </button>
                </div>
                {events.length ? (
                  events.map((event, index) => (
                    <div className="event-row" key={`${event.time}-${index}`}>
                      <CheckCircle2 size={15} />
                      <span>{event.message}</span>
                      <time>{event.time}</time>
                    </div>
                  ))
                ) : (
                  <p className="event-empty">
                    Interact with the button or submit the login form. Events
                    will appear here.
                  </p>
                )}
              </section>
            </>
          )}

          {page === "testing" && (
            <>
              <div className="report-banner">
                <span className="report-check">
                  <ShieldCheck size={32} />
                </span>
                <div>
                  <span className="banner-tag">LAST RECORDED TEST RUN</span>
                  <h2>
                    {report.passed} tests.{" "}
                    {report.tests === report.passed
                      ? "All green."
                      : "Review results."}
                  </h2>
                  <p>
                    {report.generatedAt
                      ? `Generated ${new Date(report.generatedAt).toLocaleString()} · Jest + jsdom + React Testing Library`
                      : "Run npm run test:report to generate results."}
                  </p>
                </div>
                <span className="passed-badge">
                  <CheckCircle2 size={15} />
                  {report.passed === report.tests ? "Passed" : "Pending"}
                </span>
              </div>
              <div className="coverage-grid">
                {Object.entries(report.coverage || {}).map(([name, value]) => (
                  <div className="coverage-card" key={name}>
                    <span>{name}</span>
                    <strong>
                      {value}
                      <small>%</small>
                    </strong>
                    <div className="progress-track">
                      <i style={{ width: `${value}%` }} />
                    </div>
                    <p>Minimum: {name === "branches" ? 85 : 90}%</p>
                  </div>
                ))}
              </div>
              <section className="report-table-panel">
                <div className="section-top">
                  <div>
                    <h2>Component coverage</h2>
                    <p>
                      Collected from every reusable component and validation
                      helper.
                    </p>
                  </div>
                  <span className="label-pill">
                    {report.suites} TEST SUITES
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Source file</th>
                        <th>Statements</th>
                        <th>Branches</th>
                        <th>Functions</th>
                        <th>Lines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.files.map((file) => (
                        <tr key={file.name}>
                          <td>
                            <Code2 size={15} />
                            {file.name}
                          </td>
                          {["statements", "branches", "functions", "lines"].map(
                            (key) => (
                              <td key={key}>
                                <span className="coverage-number">
                                  {file[key]}%
                                </span>
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="test-info">
                <div>
                  <h3>
                    <FlaskConical size={18} />
                    Run the tests yourself.
                  </h3>
                  <p>
                    This page shows the saved report. Re-run the suite in VS
                    Code to refresh it.
                  </p>
                  <CodeBlock>
                    {"npm test\nnpm run test:coverage\nnpm run test:report"}
                  </CodeBlock>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copy("npm run test:report")}
                    icon={<Clipboard size={14} />}
                  >
                    Copy report command
                  </Button>
                </div>
                <div>
                  <h3>
                    <ShieldCheck size={18} />
                    What gets tested?
                  </h3>
                  <ul>
                    <li>Initial rendering, props, and component structure</li>
                    <li>
                      Clicks, typing, keyboard actions, and form submission
                    </li>
                    <li>
                      Validation errors, loading states, and disabled actions
                    </li>
                    <li>
                      Accessible labels, status messages, and saved states
                    </li>
                  </ul>
                  <p>
                    Reports are generated by Jest. The browser never simulates a
                    test run.
                  </p>
                </div>
              </div>
            </>
          )}

          {page === "docs" && (
            <div className="docs-layout">
              <article className="docs-content">
                <span className="label-pill">QUICK START</span>
                <h2>Make yourself at home.</h2>
                <p>
                  NovaUI Core is a React component playground built for Codemore
                  Week 3, Task 4: Introduction to Testing Frameworks.
                </p>
                <h3>01 · Start the studio</h3>
                <p>Open the project terminal in VS Code and run:</p>
                <CodeBlock>{"npm install\nnpm run dev"}</CodeBlock>
                <h3>02 · Explore a component</h3>
                <p>
                  Choose Buttons, Form inputs, Login form, or User cards. Change
                  properties in the panel, inspect the code, and interact with
                  the live preview. Saved user cards stay in this browser across
                  reloads.
                </p>
                <h3>03 · Verify the behavior</h3>
                <CodeBlock>
                  {
                    "npm test                 # Run all tests\nnpm run test:watch       # Re-run tests as you edit\nnpm run test:coverage    # Detailed coverage report\nnpm run test:report      # Refresh the studio report\nnpm run build            # Create the production build"
                  }
                </CodeBlock>
                <p>
                  The suite uses Jest, React Testing Library, and user-event.
                  Coverage thresholds enforce 90% statements, lines, and
                  functions, plus 85% branches.
                </p>
                <h3>04 · Reuse the essentials</h3>
                <p>
                  Each component is a standalone file inside{" "}
                  <code>src/components</code>. Copy its implementation and the
                  relevant styles into your React project, then use the examples
                  in the Code tab.
                </p>
                <CodeBlock>
                  {
                    "src/\n  components/    Button, FormInput, LoginForm, UserCard\n  __tests__/     Component and integration tests\n  lib/           Form validation\n  data/          Catalog and generated test report\nreports/         Saved coverage and test summaries"
                  }
                </CodeBlock>
                <h3>A note about the login demo</h3>
                <p>
                  The form validates sample details locally. It doesn’t create
                  accounts or contact a server. Passwords are never saved and
                  are cleared after a valid submission.
                </p>
              </article>
              <aside className="docs-aside">
                <BookOpen size={24} />
                <h3>Small, on purpose.</h3>
                <p>
                  A focused component collection makes it easier to understand
                  the code and test the behavior.
                </p>
                <div className="docs-stack">
                  <span>React 19</span>
                  <span>Vite</span>
                  <span>Jest</span>
                  <span>Testing Library</span>
                </div>
                <Button
                  variant="secondary"
                  className="full-width"
                  onClick={() => openComponent("buttons")}
                >
                  Explore components <ArrowRight size={15} />
                </Button>
                <small>
                  The full README includes setup, test strategy, project
                  structure, and the recorded coverage summary.
                </small>
              </aside>
            </div>
          )}
          <footer className="page-footer">
            <span>
              NovaUI Core <i />
              Built with care, tested with intent.
            </span>
            <span>Codemore · Week 3 / Task 4</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {contact && (
        <div className="modal-backdrop" onClick={() => setContact(null)}>
          <section
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setContact(null);
              if (e.key === "Tab") {
                e.preventDefault();
                closeRef.current?.focus();
              }
            }}
          >
            <button
              ref={closeRef}
              className="modal-close"
              aria-label="Close contact details"
              onClick={() => setContact(null)}
            >
              <X size={18} />
            </button>
            <span className={`avatar avatar--${contact.color}`}>
              {contact.initials}
            </span>
            <h2 id="contact-title">Contact {contact.name}</h2>
            <p>{contact.role}</p>
            <div className="contact-email">
              <Mail size={17} />
              {contact.email}
            </div>
            <small>Sample profile for the component demo.</small>
          </section>
        </div>
      )}
    </div>
  );
}
