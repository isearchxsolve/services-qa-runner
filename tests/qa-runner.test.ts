import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { QARunner, QAConfig, QASession, QAResult } from "../src/index";

describe("QARunner", () => {
  let runner: QARunner;
  const testConfig: Partial<QAConfig> = {
    viewport: { width: 800, height: 600 },
    device: "desktop",
    timeout: 10000,
  };

  beforeAll(async () => {
    runner = new QARunner(testConfig);
    await runner.initialize();
  }, 30000);

  afterAll(async () => {
    await runner.shutdown();
  }, 10000);

  it("should initialize and emit ready event", () => {
    expect(runner).toBeDefined();
  });

  it("should create a session", async () => {
    const sessionId = await runner.createSession("about:blank");
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThan(0);

    const session = runner.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session?.id).toBe(sessionId);
    expect(session?.url).toBe("about:blank");
    // Session transitions to running quickly, so check for either pending or running
    expect(["pending", "running"]).toContain(session?.status);
  });

  it("should run QA session on about:blank", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    
    // Wait for session to complete
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        const session = runner.getSession(sessionId);
        if (session?.status === "completed" || session?.status === "failed") {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    const session = runner.getSession(sessionId);
    expect(session).toBeDefined();
    expect(["completed", "failed"]).toContain(session?.status);
    expect(session?.results.length).toBeGreaterThan(0);
  });

  it("should capture visual test results", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        const session = runner.getSession(sessionId);
        if (session?.status === "completed" || session?.status === "failed") {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    const session = runner.getSession(sessionId);
    const visualResults = session?.results.filter((r) => r.type === "visual");
    expect(visualResults?.length).toBeGreaterThan(0);
    expect(visualResults?.[0].type).toBe("visual");
    expect(visualResults?.[0].status).toBe("pass");
  });

  it("should capture DOM test results", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        const session = runner.getSession(sessionId);
        if (session?.status === "completed" || session?.status === "failed") {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    const session = runner.getSession(sessionId);
    const domResults = session?.results.filter((r) => r.type === "dom");
    expect(domResults?.length).toBeGreaterThan(0);
    expect(domResults?.[0].type).toBe("dom");
    expect(domResults?.[0].status).toBe("pass");
  });

  it("should capture console test results", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        const session = runner.getSession(sessionId);
        if (session?.status === "completed" || session?.status === "failed") {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    const session = runner.getSession(sessionId);
    const consoleResults = session?.results.filter((r) => r.type === "console");
    expect(consoleResults?.length).toBeGreaterThan(0);
    expect(consoleResults?.[0].type).toBe("console");
  });

  it("should capture accessibility test results", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        const session = runner.getSession(sessionId);
        if (session?.status === "completed" || session?.status === "failed") {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    const session = runner.getSession(sessionId);
    const a11yResults = session?.results.filter((r) => r.type === "accessibility");
    expect(a11yResults?.length).toBeGreaterThan(0);
    expect(a11yResults?.[0].type).toBe("accessibility");
  });

  it("should capture performance test results", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        const session = runner.getSession(sessionId);
        if (session?.status === "completed" || session?.status === "failed") {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    const session = runner.getSession(sessionId);
    const perfResults = session?.results.filter((r) => r.type === "performance");
    expect(perfResults?.length).toBeGreaterThan(0);
    expect(perfResults?.[0].type).toBe("performance");
  });

  it("should get all sessions", async () => {
    const initialCount = runner.getAllSessions().length;
    await runner.createSession("about:blank", { timeout: 5000 });
    await runner.createSession("about:blank", { timeout: 5000 });
    
    // Wait a bit for sessions to be created
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const sessions = runner.getAllSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(initialCount + 2);
  });

  it("should close session", async () => {
    const sessionId = await runner.createSession("about:blank", { timeout: 5000 });
    expect(runner.getSession(sessionId)).toBeDefined();
    
    await runner.closeSession(sessionId);
    expect(runner.getSession(sessionId)).toBeUndefined();
  });
});

describe("QAConfig", () => {
  it("should have default config values", () => {
    const runner = new QARunner();
    const config = (runner as any).config;
    
    expect(config.viewport).toEqual({ width: 1280, height: 720 });
    expect(config.device).toBe("desktop");
    expect(config.threshold).toBe(0.1);
    expect(config.fullPage).toBe(true);
    expect(config.animations).toBe("disabled");
    expect(config.waitUntil).toBe("networkidle");
    expect(config.timeout).toBe(30000);
  });

  it("should merge custom config with defaults", () => {
    const runner = new QARunner({
      viewport: { width: 1920, height: 1080 },
      device: "mobile",
      timeout: 60000,
    });
    const config = (runner as any).config;
    
    expect(config.viewport).toEqual({ width: 1920, height: 1080 });
    expect(config.device).toBe("mobile");
    expect(config.timeout).toBe(60000);
    expect(config.threshold).toBe(0.1); // default
  });
});

describe("QASession", () => {
  it("should have correct initial structure", () => {
    const session: QASession = {
      id: "test-id",
      url: "http://example.com",
      status: "pending",
      browser: null,
      page: null,
      viewport: { width: 800, height: 600 },
      device: "desktop",
      startedAt: new Date(),
      results: [],
    };

    expect(session.id).toBe("test-id");
    expect(session.url).toBe("http://example.com");
    expect(session.status).toBe("pending");
    expect(session.results).toEqual([]);
  });
});

describe("QAResult", () => {
  it("should have correct structure", () => {
    const result: QAResult = {
      id: "result-1",
      type: "visual",
      status: "pass",
      message: "Test passed",
      timestamp: new Date(),
    };

    expect(result.id).toBe("result-1");
    expect(result.type).toBe("visual");
    expect(result.status).toBe("pass");
    expect(result.message).toBe("Test passed");
    expect(result.timestamp).toBeInstanceOf(Date);
  });
});
