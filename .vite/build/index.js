"use strict";
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _ExifToolTask_instances, parser_fn;
const electron = require("electron");
const fs = require("fs");
const path = require("path");
const require$$0$4 = require("node:events");
const require$$1 = require("node:process");
const require$$0$2 = require("node:timers");
const require$$0 = require("node:util");
const require$$0$1 = require("node:os");
const require$$0$3 = require("node:child_process");
const require$$0$5 = require("node:fs");
const require$$1$1 = require("node:path");
const require$$1$2 = require("node:fs/promises");
function _interopNamespaceDefault(e) {
  const n2 = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n2, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n2.default = e;
  return Object.freeze(n2);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
class BaseService {
  // 註冊所有處理器
  registerHandlers() {
    this.getHandlers().forEach(({ channel, handler }) => {
      electron.ipcMain.handle(channel, async (event, ...args) => {
        try {
          return await handler(...args);
        } catch (error) {
          console.error(`Error in channel ${channel}:`, error);
          throw error;
        }
      });
    });
  }
}
var FileIPC = /* @__PURE__ */ ((FileIPC2) => {
  FileIPC2["READ"] = "file:read";
  FileIPC2["WRITE"] = "file:write";
  FileIPC2["EXISTS"] = "file:exists";
  FileIPC2["SELECT_DIRECTORY"] = "file:select-directory";
  FileIPC2["VALIDATE_IMAGE_DIRECTORY"] = "file:validate-image-directory";
  return FileIPC2;
})(FileIPC || {});
var MetadataIPC = /* @__PURE__ */ ((MetadataIPC2) => {
  MetadataIPC2["METADATA_READ"] = "metadata:read";
  MetadataIPC2["METADATA_WRITE"] = "metadata:write";
  return MetadataIPC2;
})(MetadataIPC || {});
({
  ...FileIPC,
  ...MetadataIPC
});
class FileService extends BaseService {
  getHandlers() {
    console.log("Getting FileService handlers...");
    return [
      {
        channel: FileIPC.READ,
        handler: this.readFile.bind(this)
      },
      {
        channel: FileIPC.WRITE,
        handler: this.writeFile.bind(this)
      },
      {
        channel: FileIPC.EXISTS,
        handler: this.exists.bind(this)
      },
      {
        channel: FileIPC.SELECT_DIRECTORY,
        handler: this.selectDirectory.bind(this)
      },
      {
        channel: FileIPC.VALIDATE_IMAGE_DIRECTORY,
        handler: this.validateImageDirectory.bind(this)
      }
    ];
  }
  async readFile(filePath) {
    console.log("Reading file113:", filePath);
    try {
      return await fs.promises.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`讀取文件失敗：${error.message}`);
    }
  }
  async writeFile(filePath, content) {
    console.log("Writing file:", filePath);
    try {
      await fs.promises.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(`寫入文件失敗：${error.message}`);
    }
  }
  async exists(filePath) {
    console.log("Checking if file exists:", filePath);
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * 打開目錄選擇對話框
   */
  async selectDirectory() {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled) {
      return void 0;
    }
    return result.filePaths[0];
  }
  /**
   * 驗證目錄中的圖片文件
   * @param directoryPath 目錄路徑
   * @returns 圖片文件名列表
   */
  async validateImageDirectory(directoryPath) {
    try {
      const files = await fs.promises.readdir(directoryPath);
      const supportedExtensions = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png"]);
      const imageFiles = files.filter((file) => {
        const ext = path__namespace.extname(file).toLowerCase();
        return supportedExtensions.has(ext);
      });
      if (imageFiles.length === 0) {
        throw new Error("所選目錄中沒有支持的圖片文件");
      }
      return imageFiles;
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error("目錄不存在");
      }
      if (error.code === "EACCES") {
        throw new Error("沒有訪問目錄的權限");
      }
      throw error;
    }
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var ExifTool = {};
var BatchCluster = {};
var _Array$1 = {};
Object.defineProperty(_Array$1, "__esModule", { value: true });
_Array$1.count = _Array$1.filterInPlace = void 0;
function filterInPlace$1(arr, filter) {
  const len = arr.length;
  let j = 0;
  for (let i = 0; i < len; i++) {
    const ea = arr[i];
    if (filter(ea)) {
      if (i !== j)
        arr[j] = ea;
      j++;
    }
  }
  arr.length = j;
  return arr;
}
_Array$1.filterInPlace = filterInPlace$1;
function count(arr, predicate) {
  let acc = 0;
  for (let idx = 0; idx < arr.length; idx++) {
    if (predicate(arr[idx], idx))
      acc++;
  }
  return acc;
}
_Array$1.count = count;
var BatchClusterOptions = {};
var Logger = {};
var _Object$1 = {};
Object.defineProperty(_Object$1, "__esModule", { value: true });
_Object$1.omit = _Object$1.fromEntries = _Object$1.orElse = _Object$1.isFunction = _Object$1.map = void 0;
function map$1(obj, f) {
  return obj != null ? f(obj) : void 0;
}
_Object$1.map = map$1;
function isFunction$1(obj) {
  return typeof obj === "function";
}
_Object$1.isFunction = isFunction$1;
function orElse(obj, defaultValue) {
  return obj != null ? obj : isFunction$1(defaultValue) ? defaultValue() : defaultValue;
}
_Object$1.orElse = orElse;
function fromEntries$1(arr) {
  const o = {};
  for (const [key, value] of arr) {
    if (key != null) {
      o[key] = value;
    }
  }
  return o;
}
_Object$1.fromEntries = fromEntries$1;
function omit$1(t, ...keysToOmit) {
  const result = { ...t };
  for (const ea of keysToOmit) {
    delete result[ea];
  }
  return result;
}
_Object$1.omit = omit$1;
var _String$1 = {};
Object.defineProperty(_String$1, "__esModule", { value: true });
_String$1.toS = _String$1.ensureSuffix = _String$1.notBlank = _String$1.blank = void 0;
const Object_1$3 = _Object$1;
function blank$1(s2) {
  return s2 == null || String(s2).trim().length === 0;
}
_String$1.blank = blank$1;
function notBlank$1(s2) {
  return !blank$1(s2);
}
_String$1.notBlank = notBlank$1;
function ensureSuffix(s2, suffix) {
  return s2.endsWith(suffix) ? s2 : s2 + suffix;
}
_String$1.ensureSuffix = ensureSuffix;
function toS$1(s2) {
  return s2 == null ? "" : (0, Object_1$3.isFunction)(s2.toString) ? s2.toString() : String(s2);
}
_String$1.toS = toS$1;
(function(exports2) {
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Log = exports2.logger = exports2.setLogger = exports2.NoLogger = exports2.ConsoleLogger = exports2.LogLevels = void 0;
  const node_util_1 = __importDefault2(require$$0);
  const Object_12 = _Object$1;
  const String_12 = _String$1;
  exports2.LogLevels = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
  ];
  const _debuglog = node_util_1.default.debuglog("batch-cluster");
  const noop = () => void 0;
  exports2.ConsoleLogger = Object.freeze({
    /**
     * No-ops by default, as this is very low-level information.
     */
    trace: noop,
    /**
     * Delegates to `util.debuglog("batch-cluster")`:
     * <https://nodejs.org/api/util.html#util_util_debuglog_section>
     */
    debug: _debuglog,
    /**
     * Delegates to `util.debuglog("batch-cluster")`:
     * <https://nodejs.org/api/util.html#util_util_debuglog_section>
     */
    info: _debuglog,
    /**
     * Delegates to `console.warn`
     */
    warn: console.warn,
    /**
     * Delegates to `console.error`
     */
    error: console.error
  });
  exports2.NoLogger = Object.freeze({
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
  });
  let _logger = exports2.NoLogger;
  function setLogger(l2) {
    if (exports2.LogLevels.some((ea) => typeof l2[ea] !== "function")) {
      throw new Error("invalid logger, must implement " + exports2.LogLevels);
    }
    _logger = l2;
  }
  exports2.setLogger = setLogger;
  function logger() {
    return _logger;
  }
  exports2.logger = logger;
  exports2.Log = {
    withLevels: (delegate) => {
      const timestamped = {};
      exports2.LogLevels.forEach((ea) => {
        const prefix = (ea + " ").substring(0, 5) + " | ";
        timestamped[ea] = (message, ...optionalParams) => {
          if ((0, String_12.notBlank)(message)) {
            delegate[ea](prefix + message, ...optionalParams);
          }
        };
      });
      return timestamped;
    },
    withTimestamps: (delegate) => {
      const timestamped = {};
      exports2.LogLevels.forEach((level) => timestamped[level] = (message, ...optionalParams) => (0, Object_12.map)(message, (ea) => delegate[level]((/* @__PURE__ */ new Date()).toISOString() + " | " + ea, ...optionalParams)));
      return timestamped;
    },
    filterLevels: (l2, minLogLevel) => {
      const minLogLevelIndex = exports2.LogLevels.indexOf(minLogLevel);
      const filtered = {};
      exports2.LogLevels.forEach((ea, idx) => filtered[ea] = idx < minLogLevelIndex ? noop : l2[ea].bind(l2));
      return filtered;
    }
  };
})(Logger);
var Platform = {};
var __importDefault$6 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(Platform, "__esModule", { value: true });
Platform.isLinux = Platform.isMac = Platform.isWin = void 0;
const node_os_1 = __importDefault$6(require$$0$1);
const _platform = node_os_1.default.platform();
Platform.isWin = ["win32", "cygwin"].includes(_platform);
Platform.isMac = _platform === "darwin";
Platform.isLinux = _platform === "linux";
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.verifyOptions = exports2.BatchClusterOptions = exports2.minuteMs = exports2.secondMs = void 0;
  const Logger_1 = Logger;
  const Platform_12 = Platform;
  const String_12 = _String$1;
  exports2.secondMs = 1e3;
  exports2.minuteMs = 60 * exports2.secondMs;
  class BatchClusterOptions2 {
    constructor() {
      this.maxProcs = 1;
      this.maxProcAgeMillis = 5 * exports2.minuteMs;
      this.onIdleIntervalMillis = 10 * exports2.secondMs;
      this.maxReasonableProcessFailuresPerMinute = 10;
      this.spawnTimeoutMillis = 15 * exports2.secondMs;
      this.minDelayBetweenSpawnMillis = 1.5 * exports2.secondMs;
      this.taskTimeoutMillis = 10 * exports2.secondMs;
      this.maxTasksPerProcess = 500;
      this.endGracefulWaitTimeMillis = 500;
      this.streamFlushMillis = Platform_12.isMac ? 100 : Platform_12.isWin ? 200 : 30;
      this.cleanupChildProcs = true;
      this.maxIdleMsPerProcess = 0;
      this.maxFailedTasksPerProcess = 2;
      this.healthCheckIntervalMillis = 0;
      this.pidCheckIntervalMillis = 2 * exports2.minuteMs;
      this.logger = Logger_1.logger;
    }
  }
  exports2.BatchClusterOptions = BatchClusterOptions2;
  function escapeRegExp(s2) {
    return (0, String_12.toS)(s2).replace(/[-.,\\^$*+?()|[\]{}]/g, "\\$&");
  }
  function toRe(s2) {
    return s2 instanceof RegExp ? s2 : new RegExp("(?:\\n|^)" + escapeRegExp(s2) + "(?:\\r?\\n|$)");
  }
  function verifyOptions(opts) {
    const result = {
      ...new BatchClusterOptions2(),
      ...opts,
      passRE: toRe(opts.pass),
      failRE: toRe(opts.fail)
    };
    const errors = [];
    function notBlank2(fieldName) {
      const v = (0, String_12.toS)(result[fieldName]);
      if ((0, String_12.blank)(v)) {
        errors.push(fieldName + " must not be blank");
      }
    }
    function gte(fieldName, value, why) {
      const v = result[fieldName];
      if (v < value) {
        const msg = `${fieldName} must be greater than or equal to ${value}${(0, String_12.blank)(why) ? "" : ": " + why}`;
        errors.push(msg);
      }
    }
    notBlank2("versionCommand");
    notBlank2("pass");
    notBlank2("fail");
    gte("maxTasksPerProcess", 1);
    gte("maxProcs", 1);
    if (opts.maxProcAgeMillis != null && opts.maxProcAgeMillis > 0 && result.taskTimeoutMillis) {
      gte("maxProcAgeMillis", Math.max(result.spawnTimeoutMillis, result.taskTimeoutMillis), `the max value of spawnTimeoutMillis (${result.spawnTimeoutMillis}) and taskTimeoutMillis (${result.taskTimeoutMillis})`);
    }
    gte("minDelayBetweenSpawnMillis", 0);
    gte("onIdleIntervalMillis", 0);
    gte("endGracefulWaitTimeMillis", 0);
    gte("maxReasonableProcessFailuresPerMinute", 0);
    gte("streamFlushMillis", 0);
    if (errors.length > 0) {
      throw new Error("BatchCluster was given invalid options: " + errors.join("; "));
    }
    return result;
  }
  exports2.verifyOptions = verifyOptions;
})(BatchClusterOptions);
var BatchProcess$1 = {};
var Async = {};
var __importDefault$5 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(Async, "__esModule", { value: true });
Async.ratelimit = Async.until = Async.delay = void 0;
const node_timers_1$1 = __importDefault$5(require$$0$2);
function delay(millis, unref = false) {
  return new Promise((resolve) => {
    const t = node_timers_1$1.default.setTimeout(() => resolve(), millis);
    if (unref)
      t.unref();
  });
}
Async.delay = delay;
async function until(f, timeoutMs, delayMs = 50) {
  const timeoutAt = Date.now() + timeoutMs;
  let count2 = 0;
  while (Date.now() < timeoutAt) {
    if (await f(count2)) {
      return true;
    } else {
      count2++;
      await delay(delayMs);
    }
  }
  return false;
}
Async.until = until;
function ratelimit(f, minDelayMs) {
  let next = 0;
  return (force) => {
    if (Date.now() > next || force === true) {
      next = Date.now() + minDelayMs;
      return f();
    } else {
      return;
    }
  };
}
Async.ratelimit = ratelimit;
var Deferred$1 = {};
var __classPrivateFieldSet$3 = commonjsGlobal && commonjsGlobal.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet$3 = commonjsGlobal && commonjsGlobal.__classPrivateFieldGet || function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Deferred_resolve, _Deferred_reject, _Deferred_state, _a;
Object.defineProperty(Deferred$1, "__esModule", { value: true });
Deferred$1.Deferred = void 0;
var State;
(function(State2) {
  State2[State2["pending"] = 0] = "pending";
  State2[State2["fulfilled"] = 1] = "fulfilled";
  State2[State2["rejected"] = 2] = "rejected";
})(State || (State = {}));
class Deferred {
  constructor() {
    this[_a] = "Deferred";
    _Deferred_resolve.set(this, void 0);
    _Deferred_reject.set(this, void 0);
    _Deferred_state.set(this, State.pending);
    this.promise = new Promise((resolve, reject) => {
      __classPrivateFieldSet$3(this, _Deferred_resolve, resolve, "f");
      __classPrivateFieldSet$3(this, _Deferred_reject, reject, "f");
    });
  }
  /**
   * @return `true` iff neither `resolve` nor `rejected` have been invoked
   */
  get pending() {
    return __classPrivateFieldGet$3(this, _Deferred_state, "f") === State.pending;
  }
  /**
   * @return `true` iff `resolve` has been invoked
   */
  get fulfilled() {
    return __classPrivateFieldGet$3(this, _Deferred_state, "f") === State.fulfilled;
  }
  /**
   * @return `true` iff `rejected` has been invoked
   */
  get rejected() {
    return __classPrivateFieldGet$3(this, _Deferred_state, "f") === State.rejected;
  }
  /**
   * @return `true` iff `resolve` or `rejected` have been invoked
   */
  get settled() {
    return __classPrivateFieldGet$3(this, _Deferred_state, "f") !== State.pending;
  }
  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.promise.catch(onrejected);
  }
  resolve(value) {
    if (this.settled) {
      return false;
    } else {
      __classPrivateFieldSet$3(this, _Deferred_state, State.fulfilled, "f");
      __classPrivateFieldGet$3(this, _Deferred_resolve, "f").call(this, value);
      return true;
    }
  }
  reject(reason) {
    const wasSettled = this.settled;
    __classPrivateFieldSet$3(this, _Deferred_state, State.rejected, "f");
    if (wasSettled) {
      return false;
    } else {
      __classPrivateFieldGet$3(this, _Deferred_reject, "f").call(this, reason);
      return true;
    }
  }
  observe(p) {
    void observe(this, p);
    return this;
  }
  observeQuietly(p) {
    void observeQuietly(this, p);
    return this;
  }
}
Deferred$1.Deferred = Deferred;
_Deferred_resolve = /* @__PURE__ */ new WeakMap(), _Deferred_reject = /* @__PURE__ */ new WeakMap(), _Deferred_state = /* @__PURE__ */ new WeakMap(), _a = Symbol.toStringTag;
async function observe(d, p) {
  try {
    d.resolve(await p);
  } catch (err) {
    d.reject(err);
  }
}
async function observeQuietly(d, p) {
  try {
    d.resolve(await p);
  } catch {
    d.resolve(void 0);
  }
}
var _Error = {};
Object.defineProperty(_Error, "__esModule", { value: true });
_Error.asError = _Error.cleanError = _Error.tryEach = void 0;
const String_1$a = _String$1;
function tryEach(arr) {
  for (const f of arr) {
    try {
      f();
    } catch (_) {
    }
  }
}
_Error.tryEach = tryEach;
function cleanError(s2) {
  return String(s2).trim().replace(/^error: /i, "");
}
_Error.cleanError = cleanError;
function asError(err) {
  return err instanceof Error ? err : new Error((0, String_1$a.blank)(err) ? "(unknown)" : (0, String_1$a.toS)(err));
}
_Error.asError = asError;
var Parser = {};
Object.defineProperty(Parser, "__esModule", { value: true });
Parser.SimpleParser = void 0;
const String_1$9 = _String$1;
const SimpleParser = (stdout, stderr, passed) => {
  if (!passed)
    throw new Error("task failed");
  if ((0, String_1$9.notBlank)(stderr))
    throw new Error(stderr);
  return stdout;
};
Parser.SimpleParser = SimpleParser;
var Pids = {};
var __importDefault$4 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(Pids, "__esModule", { value: true });
Pids.pids = Pids.kill = Pids.pidExists = void 0;
const node_child_process_1 = __importDefault$4(require$$0$3);
const node_process_1$1 = __importDefault$4(require$$1);
const Object_1$2 = _Object$1;
const Platform_1 = Platform;
function pidExists(pid) {
  if (pid == null || !isFinite(pid) || pid <= 0)
    return false;
  try {
    return node_process_1$1.default.kill(pid, 0);
  } catch (err) {
    if ((err === null || err === void 0 ? void 0 : err.code) === "EPERM")
      return true;
    return false;
  }
}
Pids.pidExists = pidExists;
function kill(pid, force = false) {
  if (pid == null || !isFinite(pid) || pid <= 0)
    return false;
  try {
    return node_process_1$1.default.kill(pid, force ? "SIGKILL" : void 0);
  } catch (err) {
    if (!String(err).includes("ESRCH"))
      throw err;
    return false;
  }
}
Pids.kill = kill;
const winRe = /^".+?","(\d+)"/;
const posixRe = /^\s*(\d+)/;
function pids() {
  return new Promise((resolve, reject) => {
    node_child_process_1.default.execFile(
      Platform_1.isWin ? "tasklist" : "ps",
      // NoHeader, FOrmat CSV
      Platform_1.isWin ? ["/NH", "/FO", "CSV"] : ["-e"],
      (error, stdout, stderr) => {
        if (error != null) {
          reject(error);
        } else if (("" + stderr).trim().length > 0) {
          reject(new Error(stderr));
        } else
          resolve(("" + stdout).trim().split(/[\n\r]+/).map((ea) => ea.match(Platform_1.isWin ? winRe : posixRe)).map((m) => (0, Object_1$2.map)(m === null || m === void 0 ? void 0 : m[0], parseInt)).filter((ea) => ea != null));
      }
    );
  });
}
Pids.pids = pids;
var Stream = {};
Object.defineProperty(Stream, "__esModule", { value: true });
Stream.destroy = void 0;
function destroy(stream) {
  var _a2;
  try {
    stream === null || stream === void 0 ? void 0 : stream.removeAllListeners("error");
    (_a2 = stream === null || stream === void 0 ? void 0 : stream.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(stream);
  } catch {
  }
}
Stream.destroy = destroy;
var Task$1 = {};
var __classPrivateFieldGet$2 = commonjsGlobal && commonjsGlobal.__classPrivateFieldGet || function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet$2 = commonjsGlobal && commonjsGlobal.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var _Task_instances, _Task_opts, _Task_startedAt, _Task_parsing, _Task_settledAt, _Task_d, _Task_stdout, _Task_stderr, _Task_onSettle, _Task_resolve;
Object.defineProperty(Task$1, "__esModule", { value: true });
Task$1.Task = void 0;
const Async_1$1 = Async;
const Deferred_1$1 = Deferred$1;
let _taskId = 1;
class Task {
  /**
   * @param {string} command is the value written to stdin to perform the given
   * task.
   * @param {Parser<T>} parser is used to parse resulting data from the
   * underlying process to a typed object.
   */
  constructor(command, parser) {
    _Task_instances.add(this);
    this.command = command;
    this.parser = parser;
    this.taskId = _taskId++;
    _Task_opts.set(this, void 0);
    _Task_startedAt.set(this, void 0);
    _Task_parsing.set(this, false);
    _Task_settledAt.set(this, void 0);
    _Task_d.set(this, new Deferred_1$1.Deferred());
    _Task_stdout.set(this, "");
    _Task_stderr.set(
      this,
      ""
      /**
       * @param {string} command is the value written to stdin to perform the given
       * task.
       * @param {Parser<T>} parser is used to parse resulting data from the
       * underlying process to a typed object.
       */
    );
    __classPrivateFieldGet$2(this, _Task_d, "f").promise.then(() => __classPrivateFieldGet$2(this, _Task_instances, "m", _Task_onSettle).call(this), () => __classPrivateFieldGet$2(this, _Task_instances, "m", _Task_onSettle).call(this));
  }
  /**
   * @return the resolution or rejection of this task.
   */
  get promise() {
    return __classPrivateFieldGet$2(this, _Task_d, "f").promise;
  }
  get pending() {
    return __classPrivateFieldGet$2(this, _Task_d, "f").pending;
  }
  get state() {
    return __classPrivateFieldGet$2(this, _Task_d, "f").pending ? "pending" : __classPrivateFieldGet$2(this, _Task_d, "f").rejected ? "rejected" : "resolved";
  }
  onStart(opts) {
    __classPrivateFieldSet$2(this, _Task_opts, opts, "f");
    __classPrivateFieldSet$2(this, _Task_startedAt, Date.now(), "f");
  }
  get runtimeMs() {
    var _a2;
    return __classPrivateFieldGet$2(this, _Task_startedAt, "f") == null ? void 0 : ((_a2 = __classPrivateFieldGet$2(this, _Task_settledAt, "f")) !== null && _a2 !== void 0 ? _a2 : Date.now()) - __classPrivateFieldGet$2(this, _Task_startedAt, "f");
  }
  toString() {
    return this.constructor.name + "(" + this.command.replace(/\s+/gm, " ").slice(0, 80).trim() + ")#" + this.taskId;
  }
  onStdout(buf) {
    var _a2, _b;
    __classPrivateFieldSet$2(this, _Task_stdout, __classPrivateFieldGet$2(this, _Task_stdout, "f") + buf.toString(), "f");
    const passRE = (_a2 = __classPrivateFieldGet$2(this, _Task_opts, "f")) === null || _a2 === void 0 ? void 0 : _a2.passRE;
    if (passRE != null && passRE.exec(__classPrivateFieldGet$2(this, _Task_stdout, "f")) != null) {
      __classPrivateFieldSet$2(this, _Task_stdout, __classPrivateFieldGet$2(this, _Task_stdout, "f").replace(passRE, ""), "f");
      __classPrivateFieldGet$2(this, _Task_instances, "m", _Task_resolve).call(this, true);
    } else {
      const failRE = (_b = __classPrivateFieldGet$2(this, _Task_opts, "f")) === null || _b === void 0 ? void 0 : _b.failRE;
      if (failRE != null && failRE.exec(__classPrivateFieldGet$2(this, _Task_stdout, "f")) != null) {
        __classPrivateFieldSet$2(this, _Task_stdout, __classPrivateFieldGet$2(this, _Task_stdout, "f").replace(failRE, ""), "f");
        __classPrivateFieldGet$2(this, _Task_instances, "m", _Task_resolve).call(this, false);
      }
    }
  }
  onStderr(buf) {
    var _a2;
    __classPrivateFieldSet$2(this, _Task_stderr, __classPrivateFieldGet$2(this, _Task_stderr, "f") + buf.toString(), "f");
    const failRE = (_a2 = __classPrivateFieldGet$2(this, _Task_opts, "f")) === null || _a2 === void 0 ? void 0 : _a2.failRE;
    if (failRE != null && failRE.exec(__classPrivateFieldGet$2(this, _Task_stderr, "f")) != null) {
      __classPrivateFieldSet$2(this, _Task_stderr, __classPrivateFieldGet$2(this, _Task_stderr, "f").replace(failRE, ""), "f");
      __classPrivateFieldGet$2(this, _Task_instances, "m", _Task_resolve).call(this, false);
    }
  }
  /**
   * @return true if the wrapped promise was rejected
   */
  reject(error) {
    return __classPrivateFieldGet$2(this, _Task_d, "f").reject(error);
  }
}
Task$1.Task = Task;
_Task_opts = /* @__PURE__ */ new WeakMap(), _Task_startedAt = /* @__PURE__ */ new WeakMap(), _Task_parsing = /* @__PURE__ */ new WeakMap(), _Task_settledAt = /* @__PURE__ */ new WeakMap(), _Task_d = /* @__PURE__ */ new WeakMap(), _Task_stdout = /* @__PURE__ */ new WeakMap(), _Task_stderr = /* @__PURE__ */ new WeakMap(), _Task_instances = /* @__PURE__ */ new WeakSet(), _Task_onSettle = function _Task_onSettle2() {
  var _a2;
  __classPrivateFieldSet$2(this, _Task_settledAt, (_a2 = __classPrivateFieldGet$2(this, _Task_settledAt, "f")) !== null && _a2 !== void 0 ? _a2 : Date.now(), "f");
}, _Task_resolve = async function _Task_resolve2(passed) {
  var _a2, _b, _c;
  passed = !__classPrivateFieldGet$2(this, _Task_d, "f").rejected && passed;
  const flushMs = (_b = (_a2 = __classPrivateFieldGet$2(this, _Task_opts, "f")) === null || _a2 === void 0 ? void 0 : _a2.streamFlushMillis) !== null && _b !== void 0 ? _b : 0;
  if (flushMs > 0) {
    await (0, Async_1$1.delay)(flushMs);
  }
  if (!this.pending || __classPrivateFieldGet$2(this, _Task_parsing, "f"))
    return;
  __classPrivateFieldSet$2(this, _Task_parsing, true, "f");
  try {
    const parseResult = await this.parser(__classPrivateFieldGet$2(this, _Task_stdout, "f"), __classPrivateFieldGet$2(this, _Task_stderr, "f"), passed);
    if (__classPrivateFieldGet$2(this, _Task_d, "f").resolve(parseResult)) {
    } else {
      (_c = __classPrivateFieldGet$2(this, _Task_opts, "f")) === null || _c === void 0 ? void 0 : _c.observer.emit("internalError", new Error(this.toString() + " ._resolved() more than once"));
    }
  } catch (error) {
    this.reject(error);
  }
};
var Timeout = {};
(function(exports2) {
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.thenOrTimeout = exports2.Timeout = void 0;
  const node_timers_12 = __importDefault2(require$$0$2);
  exports2.Timeout = Symbol("timeout");
  async function thenOrTimeout(p, timeoutMs) {
    return timeoutMs <= 1 ? p : new Promise(async (resolve, reject) => {
      let pending = true;
      try {
        const t = node_timers_12.default.setTimeout(() => {
          if (pending) {
            pending = false;
            resolve(exports2.Timeout);
          }
        }, timeoutMs);
        const result = await p;
        if (pending) {
          pending = false;
          clearTimeout(t);
          resolve(result);
        }
      } catch (err) {
        if (pending) {
          pending = false;
          reject(err);
        }
      }
    });
  }
  exports2.thenOrTimeout = thenOrTimeout;
})(Timeout);
var __classPrivateFieldSet$1 = commonjsGlobal && commonjsGlobal.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet$1 = commonjsGlobal && commonjsGlobal.__classPrivateFieldGet || function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault$3 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
var _BatchProcess_instances, _BatchProcess_lastHealthCheck, _BatchProcess_healthCheckFailures, _BatchProcess_logger, _BatchProcess_lastJobFinshedAt, _BatchProcess_lastJobFailed, _BatchProcess_starting, _BatchProcess_exited, _BatchProcess_whyNotHealthy, _BatchProcess_taskCount, _BatchProcess_currentTask, _BatchProcess_currentTaskTimeout, _BatchProcess_endPromise, _BatchProcess_execTask, _BatchProcess_end, _BatchProcess_awaitNotRunning, _BatchProcess_onTimeout, _BatchProcess_onError, _BatchProcess_onStderr, _BatchProcess_onStdout, _BatchProcess_clearCurrentTask;
Object.defineProperty(BatchProcess$1, "__esModule", { value: true });
BatchProcess$1.BatchProcess = void 0;
const node_timers_1 = __importDefault$3(require$$0$2);
const Async_1 = Async;
const Deferred_1 = Deferred$1;
const Error_1 = _Error;
const Object_1$1 = _Object$1;
const Parser_1 = Parser;
const Pids_1 = Pids;
const Stream_1 = Stream;
const String_1$8 = _String$1;
const Task_1 = Task$1;
const Timeout_1 = Timeout;
class BatchProcess {
  /**
   * @param onIdle to be called when internal state changes (like the current
   * task is resolved, or the process exits)
   */
  constructor(proc, opts, onIdle) {
    _BatchProcess_instances.add(this);
    this.proc = proc;
    this.opts = opts;
    this.onIdle = onIdle;
    this.start = Date.now();
    _BatchProcess_lastHealthCheck.set(this, Date.now());
    _BatchProcess_healthCheckFailures.set(this, 0);
    _BatchProcess_logger.set(this, void 0);
    _BatchProcess_lastJobFinshedAt.set(this, Date.now());
    _BatchProcess_lastJobFailed.set(
      this,
      false
      // Only set to true when `proc.pid` is no longer in the process table.
    );
    _BatchProcess_starting.set(this, true);
    _BatchProcess_exited.set(
      this,
      false
      // override for .whyNotHealthy()
    );
    _BatchProcess_whyNotHealthy.set(this, void 0);
    this.failedTaskCount = 0;
    _BatchProcess_taskCount.set(
      this,
      -1
      /**
       * Should be undefined if this instance is not currently processing a task.
       */
    );
    _BatchProcess_currentTask.set(this, void 0);
    _BatchProcess_currentTaskTimeout.set(this, void 0);
    _BatchProcess_endPromise.set(this, void 0);
    this.name = "BatchProcess(" + proc.pid + ")";
    __classPrivateFieldSet$1(this, _BatchProcess_logger, opts.logger, "f");
    this.proc.unref();
    if (proc.pid == null) {
      throw new Error("BatchProcess.constructor: child process pid is null");
    }
    this.pid = proc.pid;
    this.proc.on("error", (err) => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onError).call(this, "proc.error", err));
    this.proc.on("close", () => this.end(false, "proc.close"));
    this.proc.on("exit", () => this.end(false, "proc.exit"));
    this.proc.on("disconnect", () => this.end(false, "proc.disconnect"));
    const stdin = this.proc.stdin;
    if (stdin == null)
      throw new Error("Given proc had no stdin");
    stdin.on("error", (err) => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onError).call(this, "stdin.error", err));
    const stdout = this.proc.stdout;
    if (stdout == null)
      throw new Error("Given proc had no stdout");
    stdout.on("error", (err) => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onError).call(this, "stdout.error", err));
    stdout.on("data", (d) => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onStdout).call(this, d));
    (0, Object_1$1.map)(this.proc.stderr, (stderr) => {
      stderr.on("error", (err) => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onError).call(this, "stderr.error", err));
      stderr.on("data", (err) => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onStderr).call(this, err));
    });
    const startupTask = new Task_1.Task(opts.versionCommand, Parser_1.SimpleParser);
    this.startupTaskId = startupTask.taskId;
    if (!this.execTask(startupTask)) {
      this.opts.observer.emit("internalError", new Error(this.name + " startup task was not submitted"));
    }
    this.opts.observer.emit("childStart", this);
  }
  get currentTask() {
    return __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f");
  }
  get taskCount() {
    return __classPrivateFieldGet$1(this, _BatchProcess_taskCount, "f");
  }
  get starting() {
    return __classPrivateFieldGet$1(this, _BatchProcess_starting, "f");
  }
  /**
   * @return true if `this.end()` has been requested (which may be due to the
   * child process exiting)
   */
  get ending() {
    return __classPrivateFieldGet$1(this, _BatchProcess_endPromise, "f") != null;
  }
  /**
   * @return true if `this.end()` has completed running, which includes child
   * process cleanup. Note that this may return `true` and the process table may
   * still include the child pid. Call {@link BatchProcess#running()} for an authoritative
   * (but expensive!) answer.
   */
  get ended() {
    var _a2;
    return true === ((_a2 = __classPrivateFieldGet$1(this, _BatchProcess_endPromise, "f")) === null || _a2 === void 0 ? void 0 : _a2.settled);
  }
  /**
   * @return true if the child process has exited and is no longer in the
   * process table. Note that this may be erroneously false if the process table
   * hasn't been checked. Call {@link BatchProcess#running()} for an authoritative (but
   * expensive!) answer.
   */
  get exited() {
    return __classPrivateFieldGet$1(this, _BatchProcess_exited, "f");
  }
  /**
   * @return a string describing why this process should be recycled, or null if
   * the process passes all health checks. Note that this doesn't include if
   * we're already busy: see {@link BatchProcess.whyNotReady} if you need to
   * know if a process can handle a new task.
   */
  get whyNotHealthy() {
    var _a2, _b;
    if (__classPrivateFieldGet$1(this, _BatchProcess_whyNotHealthy, "f") != null)
      return __classPrivateFieldGet$1(this, _BatchProcess_whyNotHealthy, "f");
    if (this.ended) {
      return "ended";
    } else if (this.ending) {
      return "ending";
    } else if (__classPrivateFieldGet$1(this, _BatchProcess_healthCheckFailures, "f") > 0) {
      return "unhealthy";
    } else if (this.proc.stdin == null || this.proc.stdin.destroyed) {
      return "closed";
    } else if (this.opts.maxTasksPerProcess > 0 && this.taskCount >= this.opts.maxTasksPerProcess) {
      return "worn";
    } else if (this.opts.maxIdleMsPerProcess > 0 && this.idleMs > this.opts.maxIdleMsPerProcess) {
      return "idle";
    } else if (this.opts.maxFailedTasksPerProcess > 0 && this.failedTaskCount >= this.opts.maxFailedTasksPerProcess) {
      return "broken";
    } else if (this.opts.maxProcAgeMillis > 0 && this.start + this.opts.maxProcAgeMillis < Date.now()) {
      return "old";
    } else if ((_b = this.opts.taskTimeoutMillis > 0 && ((_a2 = __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f")) === null || _a2 === void 0 ? void 0 : _a2.runtimeMs)) !== null && _b !== void 0 ? _b : 0 > this.opts.taskTimeoutMillis) {
      return "timeout";
    } else {
      return null;
    }
  }
  /**
   * @return true if the process doesn't need to be recycled.
   */
  get healthy() {
    return this.whyNotHealthy == null;
  }
  /**
   * @return true iff no current task. Does not take into consideration if the
   * process has ended or should be recycled: see {@link BatchProcess.ready}.
   */
  get idle() {
    return __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f") == null;
  }
  /**
   * @return a string describing why this process cannot currently handle a new
   * task, or `undefined` if this process is idle and healthy.
   */
  get whyNotReady() {
    return !this.idle ? "busy" : this.whyNotHealthy;
  }
  /**
   * @return true iff this process is  both healthy and idle, and ready for a
   * new task.
   */
  get ready() {
    return this.whyNotReady == null;
  }
  get idleMs() {
    return this.idle ? Date.now() - __classPrivateFieldGet$1(this, _BatchProcess_lastJobFinshedAt, "f") : -1;
  }
  /**
   * @return true if the child process is in the process table
   */
  running() {
    if (__classPrivateFieldGet$1(this, _BatchProcess_exited, "f"))
      return false;
    const alive = (0, Pids_1.pidExists)(this.pid);
    if (!alive) {
      __classPrivateFieldSet$1(this, _BatchProcess_exited, true, "f");
      this.end(false, "proc.exit");
    }
    return alive;
  }
  notRunning() {
    return !this.running();
  }
  maybeRunHealthcheck() {
    const hcc = this.opts.healthCheckCommand;
    if (hcc == null || (0, String_1$8.blank)(hcc))
      return;
    if (!this.ready)
      return;
    if (__classPrivateFieldGet$1(this, _BatchProcess_lastJobFailed, "f") || this.opts.healthCheckIntervalMillis > 0 && Date.now() - __classPrivateFieldGet$1(this, _BatchProcess_lastHealthCheck, "f") > this.opts.healthCheckIntervalMillis) {
      __classPrivateFieldSet$1(this, _BatchProcess_lastHealthCheck, Date.now(), "f");
      const t = new Task_1.Task(hcc, Parser_1.SimpleParser);
      t.promise.catch((err) => {
        var _a2;
        this.opts.observer.emit("healthCheckError", err, this);
        __classPrivateFieldSet$1(this, _BatchProcess_healthCheckFailures, (_a2 = __classPrivateFieldGet$1(this, _BatchProcess_healthCheckFailures, "f"), _a2++, _a2), "f");
      }).finally(() => {
        __classPrivateFieldSet$1(this, _BatchProcess_lastHealthCheck, Date.now(), "f");
      });
      __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_execTask).call(this, t);
      return t;
    }
    return;
  }
  // This must not be async, or new instances aren't started as busy (until the
  // startup task is complete)
  execTask(task) {
    return this.ready ? __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_execTask).call(this, task) : false;
  }
  /**
   * End this child process.
   *
   * @param gracefully Wait for any current task to be resolved or rejected
   * before shutting down the child process.
   * @param reason who called end() (used for logging)
   * @return Promise that will be resolved when the process has completed.
   * Subsequent calls to end() will ignore the parameters and return the first
   * endPromise.
   */
  // NOT ASYNC! needs to change state immediately.
  end(gracefully = true, reason) {
    var _a2, _b;
    return __classPrivateFieldSet$1(this, _BatchProcess_endPromise, (_a2 = __classPrivateFieldGet$1(this, _BatchProcess_endPromise, "f")) !== null && _a2 !== void 0 ? _a2 : new Deferred_1.Deferred().observe(__classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_end).call(this, gracefully, __classPrivateFieldSet$1(this, _BatchProcess_whyNotHealthy, (_b = __classPrivateFieldGet$1(this, _BatchProcess_whyNotHealthy, "f")) !== null && _b !== void 0 ? _b : reason, "f"))), "f").promise;
  }
}
BatchProcess$1.BatchProcess = BatchProcess;
_BatchProcess_lastHealthCheck = /* @__PURE__ */ new WeakMap(), _BatchProcess_healthCheckFailures = /* @__PURE__ */ new WeakMap(), _BatchProcess_logger = /* @__PURE__ */ new WeakMap(), _BatchProcess_lastJobFinshedAt = /* @__PURE__ */ new WeakMap(), _BatchProcess_lastJobFailed = /* @__PURE__ */ new WeakMap(), _BatchProcess_starting = /* @__PURE__ */ new WeakMap(), _BatchProcess_exited = /* @__PURE__ */ new WeakMap(), _BatchProcess_whyNotHealthy = /* @__PURE__ */ new WeakMap(), _BatchProcess_taskCount = /* @__PURE__ */ new WeakMap(), _BatchProcess_currentTask = /* @__PURE__ */ new WeakMap(), _BatchProcess_currentTaskTimeout = /* @__PURE__ */ new WeakMap(), _BatchProcess_endPromise = /* @__PURE__ */ new WeakMap(), _BatchProcess_instances = /* @__PURE__ */ new WeakSet(), _BatchProcess_execTask = function _BatchProcess_execTask2(task) {
  var _a2;
  var _b;
  if (this.ending)
    return false;
  __classPrivateFieldSet$1(this, _BatchProcess_taskCount, (_b = __classPrivateFieldGet$1(this, _BatchProcess_taskCount, "f"), _b++, _b), "f");
  __classPrivateFieldSet$1(this, _BatchProcess_currentTask, task, "f");
  const cmd = (0, String_1$8.ensureSuffix)(task.command, "\n");
  const isStartupTask = task.taskId === this.startupTaskId;
  const taskTimeoutMs = isStartupTask ? this.opts.spawnTimeoutMillis : this.opts.taskTimeoutMillis;
  if (taskTimeoutMs > 0) {
    __classPrivateFieldSet$1(this, _BatchProcess_currentTaskTimeout, node_timers_1.default.setTimeout(() => __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onTimeout).call(this, task, taskTimeoutMs), taskTimeoutMs + this.opts.streamFlushMillis), "f");
  }
  void task.promise.then(() => {
    __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_clearCurrentTask).call(this, task);
    if (isStartupTask) {
      __classPrivateFieldSet$1(this, _BatchProcess_starting, false, "f");
    } else {
      this.opts.observer.emit("taskResolved", task, this);
    }
    this.onIdle();
  }, (error) => {
    __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_clearCurrentTask).call(this, task);
    if (isStartupTask) {
      this.opts.observer.emit("startError", error);
      this.end(false, "startError");
    } else {
      this.opts.observer.emit("taskError", error, task, this);
    }
    this.onIdle();
  });
  try {
    task.onStart(this.opts);
    const stdin = (_a2 = this.proc) === null || _a2 === void 0 ? void 0 : _a2.stdin;
    if (stdin == null || stdin.destroyed) {
      task.reject(new Error("proc.stdin unexpectedly closed"));
      return false;
    } else {
      stdin.write(cmd, (err) => {
        if (err != null) {
          task.reject(err);
        }
      });
      return true;
    }
  } catch (err) {
    this.end(false, "stdin.error");
    return false;
  }
}, _BatchProcess_end = // NOTE: Must only be invoked by this.end(), and only expected to be invoked
// once per instance.
async function _BatchProcess_end2(gracefully, reason) {
  var _a2, _b, _c, _d;
  const lastTask = __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f");
  __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_clearCurrentTask).call(this);
  if (lastTask != null && lastTask.taskId !== this.startupTaskId) {
    try {
      await (0, Timeout_1.thenOrTimeout)(lastTask.promise, gracefully ? 2e3 : 250);
    } catch {
    }
    if (lastTask.pending) {
      lastTask.reject(new Error(`end() called before task completed (${JSON.stringify({
        gracefully,
        lastTask
      })})`));
    }
  }
  for (const ea of [
    this.proc,
    this.proc.stdin,
    this.proc.stdout,
    this.proc.stderr
  ]) {
    ea === null || ea === void 0 ? void 0 : ea.removeAllListeners("error");
  }
  if (true === ((_a2 = this.proc.stdin) === null || _a2 === void 0 ? void 0 : _a2.writable)) {
    const exitCmd = this.opts.exitCommand == null ? null : (0, String_1$8.ensureSuffix)(this.opts.exitCommand, "\n");
    try {
      (_b = this.proc.stdin) === null || _b === void 0 ? void 0 : _b.end(exitCmd);
    } catch {
    }
  }
  (0, Stream_1.destroy)(this.proc.stdin);
  (0, Stream_1.destroy)(this.proc.stdout);
  (0, Stream_1.destroy)(this.proc.stderr);
  if (this.opts.cleanupChildProcs && gracefully && this.opts.endGracefulWaitTimeMillis > 0 && !__classPrivateFieldGet$1(this, _BatchProcess_exited, "f")) {
    await __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_awaitNotRunning).call(this, this.opts.endGracefulWaitTimeMillis / 2);
    if (this.running() && this.proc.pid != null)
      this.proc.kill();
    await __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_awaitNotRunning).call(this, this.opts.endGracefulWaitTimeMillis / 2);
  }
  if (this.opts.cleanupChildProcs && this.proc.pid != null && this.running()) {
    __classPrivateFieldGet$1(this, _BatchProcess_logger, "f").call(this).warn(this.name + ".end(): force-killing still-running child.");
    (0, Pids_1.kill)(this.proc.pid, true);
  }
  (_d = (_c = this.proc).disconnect) === null || _d === void 0 ? void 0 : _d.call(_c);
  this.opts.observer.emit("childEnd", this, reason);
}, _BatchProcess_awaitNotRunning = function _BatchProcess_awaitNotRunning2(timeout) {
  return (0, Async_1.until)(() => this.notRunning(), timeout);
}, _BatchProcess_onTimeout = function _BatchProcess_onTimeout2(task, timeoutMs) {
  if (task.pending) {
    this.opts.observer.emit("taskTimeout", timeoutMs, task, this);
    __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_onError).call(this, "timeout", new Error("waited " + timeoutMs + "ms"), task);
  }
}, _BatchProcess_onError = function _BatchProcess_onError2(reason, error, task) {
  if (task == null) {
    task = __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f");
  }
  const cleanedError = new Error(reason + ": " + (0, Error_1.cleanError)(error.message));
  if (error.stack != null) {
    cleanedError.stack = (0, Error_1.cleanError)(error.stack);
  }
  __classPrivateFieldGet$1(this, _BatchProcess_logger, "f").call(this).warn(this.name + ".onError()", {
    reason,
    task: (0, Object_1$1.map)(task, (t) => t.command),
    error: cleanedError
  });
  if (this.ending) {
    return;
  }
  __classPrivateFieldGet$1(this, _BatchProcess_instances, "m", _BatchProcess_clearCurrentTask).call(this);
  void this.end(false, reason);
  if (task != null && this.taskCount === 1) {
    __classPrivateFieldGet$1(this, _BatchProcess_logger, "f").call(this).warn(this.name + ".onError(): startup task failed: " + cleanedError);
    this.opts.observer.emit("startError", cleanedError);
  }
  if (task != null) {
    if (task.pending) {
      task.reject(cleanedError);
    } else {
      this.opts.observer.emit("internalError", new Error(`${this.name}.onError(${cleanedError}) cannot reject already-fulfilled task.`));
    }
  }
}, _BatchProcess_onStderr = function _BatchProcess_onStderr2(data) {
  if ((0, String_1$8.blank)(data))
    return;
  __classPrivateFieldGet$1(this, _BatchProcess_logger, "f").call(this).warn(this.name + ".onStderr(): " + data);
  const task = __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f");
  if (task != null && task.pending) {
    task.onStderr(data);
  } else if (!this.ending) {
    this.opts.observer.emit("noTaskData", null, data, this);
    void this.end(false, "stderr");
  }
}, _BatchProcess_onStdout = function _BatchProcess_onStdout2(data) {
  if (data == null)
    return;
  const task = __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f");
  if (task != null && task.pending) {
    this.opts.observer.emit("taskData", data, task, this);
    task.onStdout(data);
  } else if (this.ending) ;
  else if (!(0, String_1$8.blank)(data)) {
    this.opts.observer.emit("noTaskData", data, null, this);
    void this.end(false, "stdout.error");
  }
}, _BatchProcess_clearCurrentTask = function _BatchProcess_clearCurrentTask2(task) {
  var _a2;
  __classPrivateFieldSet$1(this, _BatchProcess_lastJobFailed, (task === null || task === void 0 ? void 0 : task.state) === "rejected", "f");
  if (task != null && task.taskId !== ((_a2 = __classPrivateFieldGet$1(this, _BatchProcess_currentTask, "f")) === null || _a2 === void 0 ? void 0 : _a2.taskId))
    return;
  (0, Object_1$1.map)(__classPrivateFieldGet$1(this, _BatchProcess_currentTaskTimeout, "f"), (ea) => clearTimeout(ea));
  __classPrivateFieldSet$1(this, _BatchProcess_currentTaskTimeout, void 0, "f");
  __classPrivateFieldSet$1(this, _BatchProcess_currentTask, void 0, "f");
  __classPrivateFieldSet$1(this, _BatchProcess_lastJobFinshedAt, Date.now(), "f");
};
var Mean$1 = {};
Object.defineProperty(Mean$1, "__esModule", { value: true });
Mean$1.Mean = void 0;
class Mean {
  constructor(n2 = 0, sum = 0) {
    this.sum = sum;
    this._min = void 0;
    this._max = void 0;
    this._n = n2;
  }
  push(x) {
    this._n++;
    this.sum += x;
    this._min = this._min == null || this._min > x ? x : this._min;
    this._max = this._max == null || this._max < x ? x : this._max;
  }
  get n() {
    return this._n;
  }
  get min() {
    return this._min;
  }
  get max() {
    return this._max;
  }
  get mean() {
    return this.sum / this.n;
  }
  clone() {
    return new Mean(this.n, this.sum);
  }
}
Mean$1.Mean = Mean;
var Rate$1 = {};
var __classPrivateFieldGet = commonjsGlobal && commonjsGlobal.__classPrivateFieldGet || function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = commonjsGlobal && commonjsGlobal.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var _Rate_instances, _Rate_start, _Rate_priorEventTimestamps, _Rate_lastEventTs, _Rate_eventCount, _Rate_vacuum;
Object.defineProperty(Rate$1, "__esModule", { value: true });
Rate$1.Rate = void 0;
const BatchClusterOptions_1 = BatchClusterOptions;
class Rate {
  /**
   * @param periodMs the length of time to retain event timestamps for computing
   * rate. Events older than this value will be discarded.
   * @param warmupMs return `null` from {@link Rate#msPerEvent} if it's been less
   * than `warmupMs` since construction or {@link Rate#clear}.
   */
  constructor(periodMs = BatchClusterOptions_1.minuteMs, warmupMs = BatchClusterOptions_1.secondMs) {
    _Rate_instances.add(this);
    this.periodMs = periodMs;
    this.warmupMs = warmupMs;
    _Rate_start.set(this, Date.now());
    _Rate_priorEventTimestamps.set(this, []);
    _Rate_lastEventTs.set(this, null);
    _Rate_eventCount.set(
      this,
      0
      /**
       * @param periodMs the length of time to retain event timestamps for computing
       * rate. Events older than this value will be discarded.
       * @param warmupMs return `null` from {@link Rate#msPerEvent} if it's been less
       * than `warmupMs` since construction or {@link Rate#clear}.
       */
    );
  }
  onEvent() {
    var _a2;
    __classPrivateFieldSet(this, _Rate_eventCount, (_a2 = __classPrivateFieldGet(this, _Rate_eventCount, "f"), _a2++, _a2), "f");
    const now2 = Date.now();
    __classPrivateFieldGet(this, _Rate_priorEventTimestamps, "f").push(now2);
    __classPrivateFieldSet(this, _Rate_lastEventTs, now2, "f");
  }
  get eventCount() {
    return __classPrivateFieldGet(this, _Rate_eventCount, "f");
  }
  get msSinceLastEvent() {
    return __classPrivateFieldGet(this, _Rate_lastEventTs, "f") == null ? null : Date.now() - __classPrivateFieldGet(this, _Rate_lastEventTs, "f");
  }
  get msPerEvent() {
    const msSinceStart = Date.now() - __classPrivateFieldGet(this, _Rate_start, "f");
    if (__classPrivateFieldGet(this, _Rate_lastEventTs, "f") == null || msSinceStart < this.warmupMs)
      return null;
    __classPrivateFieldGet(this, _Rate_instances, "m", _Rate_vacuum).call(this);
    const events = __classPrivateFieldGet(this, _Rate_priorEventTimestamps, "f").length;
    return events === 0 ? null : Math.min(this.periodMs, msSinceStart) / events;
  }
  get eventsPerMs() {
    const mpe = this.msPerEvent;
    return mpe == null ? 0 : mpe < 1 ? 1 : 1 / mpe;
  }
  get eventsPerSecond() {
    return this.eventsPerMs * BatchClusterOptions_1.secondMs;
  }
  get eventsPerMinute() {
    return this.eventsPerMs * BatchClusterOptions_1.minuteMs;
  }
  clear() {
    __classPrivateFieldSet(this, _Rate_start, Date.now(), "f");
    __classPrivateFieldGet(this, _Rate_priorEventTimestamps, "f").length = 0;
    __classPrivateFieldSet(this, _Rate_lastEventTs, null, "f");
    __classPrivateFieldSet(this, _Rate_eventCount, 0, "f");
    return this;
  }
}
Rate$1.Rate = Rate;
_Rate_start = /* @__PURE__ */ new WeakMap(), _Rate_priorEventTimestamps = /* @__PURE__ */ new WeakMap(), _Rate_lastEventTs = /* @__PURE__ */ new WeakMap(), _Rate_eventCount = /* @__PURE__ */ new WeakMap(), _Rate_instances = /* @__PURE__ */ new WeakSet(), _Rate_vacuum = function _Rate_vacuum2() {
  const expired = Date.now() - this.periodMs;
  const firstValidIndex = __classPrivateFieldGet(this, _Rate_priorEventTimestamps, "f").findIndex((ea) => ea > expired);
  if (firstValidIndex === -1)
    __classPrivateFieldGet(this, _Rate_priorEventTimestamps, "f").length = 0;
  else if (firstValidIndex > 0) {
    __classPrivateFieldGet(this, _Rate_priorEventTimestamps, "f").splice(0, firstValidIndex);
  }
};
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding2(exports3, m, p);
  };
  var __classPrivateFieldGet2 = commonjsGlobal && commonjsGlobal.__classPrivateFieldGet || function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
  var __classPrivateFieldSet2 = commonjsGlobal && commonjsGlobal.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
  };
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  var _BatchCluster_instances, _BatchCluster_tasksPerProc, _BatchCluster_logger, _BatchCluster_procs, _BatchCluster_onIdleRequested, _BatchCluster_nextSpawnTime, _BatchCluster_lastPidsCheckTime, _BatchCluster_tasks, _BatchCluster_onIdleInterval, _BatchCluster_startErrorRate, _BatchCluster_spawnedProcs, _BatchCluster_endPromise, _BatchCluster_internalErrorCount, _BatchCluster_childEndCounts, _BatchCluster_beforeExitListener, _BatchCluster_exitListener, _BatchCluster_onIdleLater, _BatchCluster_onIdle, _BatchCluster_maybeCheckPids, _BatchCluster_execNextTask, _BatchCluster_maxSpawnDelay, _BatchCluster_procsToSpawn, _BatchCluster_maybeSpawnProcs, _BatchCluster_spawnNewProc;
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.BatchCluster = exports2.Task = exports2.Rate = exports2.pids = exports2.pidExists = exports2.kill = exports2.SimpleParser = exports2.Deferred = exports2.BatchProcess = exports2.BatchClusterOptions = void 0;
  const node_events_1 = __importDefault2(require$$0$4);
  const node_process_12 = __importDefault2(require$$1);
  const node_timers_12 = __importDefault2(require$$0$2);
  const Array_12 = _Array$1;
  const BatchClusterOptions_12 = BatchClusterOptions;
  const BatchProcess_1 = BatchProcess$1;
  const Deferred_12 = Deferred$1;
  const Error_12 = _Error;
  const Mean_1 = Mean$1;
  const Object_12 = _Object$1;
  const Rate_1 = Rate$1;
  const String_12 = _String$1;
  const Timeout_12 = Timeout;
  var BatchClusterOptions_2 = BatchClusterOptions;
  Object.defineProperty(exports2, "BatchClusterOptions", { enumerable: true, get: function() {
    return BatchClusterOptions_2.BatchClusterOptions;
  } });
  var BatchProcess_2 = BatchProcess$1;
  Object.defineProperty(exports2, "BatchProcess", { enumerable: true, get: function() {
    return BatchProcess_2.BatchProcess;
  } });
  var Deferred_2 = Deferred$1;
  Object.defineProperty(exports2, "Deferred", { enumerable: true, get: function() {
    return Deferred_2.Deferred;
  } });
  __exportStar(Logger, exports2);
  var Parser_12 = Parser;
  Object.defineProperty(exports2, "SimpleParser", { enumerable: true, get: function() {
    return Parser_12.SimpleParser;
  } });
  var Pids_12 = Pids;
  Object.defineProperty(exports2, "kill", { enumerable: true, get: function() {
    return Pids_12.kill;
  } });
  Object.defineProperty(exports2, "pidExists", { enumerable: true, get: function() {
    return Pids_12.pidExists;
  } });
  Object.defineProperty(exports2, "pids", { enumerable: true, get: function() {
    return Pids_12.pids;
  } });
  var Rate_2 = Rate$1;
  Object.defineProperty(exports2, "Rate", { enumerable: true, get: function() {
    return Rate_2.Rate;
  } });
  var Task_12 = Task$1;
  Object.defineProperty(exports2, "Task", { enumerable: true, get: function() {
    return Task_12.Task;
  } });
  class BatchCluster2 {
    constructor(opts) {
      _BatchCluster_instances.add(this);
      _BatchCluster_tasksPerProc.set(this, new Mean_1.Mean());
      _BatchCluster_logger.set(this, void 0);
      _BatchCluster_procs.set(this, []);
      _BatchCluster_onIdleRequested.set(this, false);
      _BatchCluster_nextSpawnTime.set(this, 0);
      _BatchCluster_lastPidsCheckTime.set(this, 0);
      _BatchCluster_tasks.set(this, []);
      _BatchCluster_onIdleInterval.set(this, void 0);
      _BatchCluster_startErrorRate.set(this, new Rate_1.Rate());
      _BatchCluster_spawnedProcs.set(this, 0);
      _BatchCluster_endPromise.set(this, void 0);
      _BatchCluster_internalErrorCount.set(this, 0);
      _BatchCluster_childEndCounts.set(this, /* @__PURE__ */ new Map());
      this.emitter = new node_events_1.default.EventEmitter();
      this.on = this.emitter.on.bind(this.emitter);
      this.off = this.emitter.off.bind(this.emitter);
      _BatchCluster_beforeExitListener.set(this, () => this.end(true));
      _BatchCluster_exitListener.set(this, () => this.end(false));
      _BatchCluster_onIdleLater.set(
        this,
        () => {
          if (!__classPrivateFieldGet2(this, _BatchCluster_onIdleRequested, "f")) {
            __classPrivateFieldSet2(this, _BatchCluster_onIdleRequested, true, "f");
            node_timers_12.default.setTimeout(() => __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_onIdle).call(this), 1);
          }
        }
        // NOT ASYNC: updates internal state:
      );
      this.options = (0, BatchClusterOptions_12.verifyOptions)({ ...opts, observer: this.emitter });
      this.on("childEnd", (bp, why) => {
        var _a2;
        __classPrivateFieldGet2(this, _BatchCluster_tasksPerProc, "f").push(bp.taskCount);
        __classPrivateFieldGet2(this, _BatchCluster_childEndCounts, "f").set(why, ((_a2 = __classPrivateFieldGet2(this, _BatchCluster_childEndCounts, "f").get(why)) !== null && _a2 !== void 0 ? _a2 : 0) + 1);
        __classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f").call(this);
      });
      this.on("internalError", (error) => {
        var _a2;
        __classPrivateFieldGet2(this, _BatchCluster_logger, "f").call(this).error("BatchCluster: INTERNAL ERROR: " + error);
        __classPrivateFieldSet2(this, _BatchCluster_internalErrorCount, (_a2 = __classPrivateFieldGet2(this, _BatchCluster_internalErrorCount, "f"), _a2++, _a2), "f");
      });
      this.on("noTaskData", (stdout, stderr, proc) => {
        var _a2;
        __classPrivateFieldGet2(this, _BatchCluster_logger, "f").call(this).warn("BatchCluster: child process emitted data with no current task. Consider setting streamFlushMillis to a higher value.", {
          streamFlushMillis: this.options.streamFlushMillis,
          stdout: (0, String_12.toS)(stdout),
          stderr: (0, String_12.toS)(stderr),
          proc_pid: proc === null || proc === void 0 ? void 0 : proc.pid
        });
        __classPrivateFieldSet2(this, _BatchCluster_internalErrorCount, (_a2 = __classPrivateFieldGet2(this, _BatchCluster_internalErrorCount, "f"), _a2++, _a2), "f");
      });
      this.on("startError", (error) => {
        __classPrivateFieldGet2(this, _BatchCluster_logger, "f").call(this).warn("BatchCluster.onStartError(): " + error);
        __classPrivateFieldGet2(this, _BatchCluster_startErrorRate, "f").onEvent();
        if (this.options.maxReasonableProcessFailuresPerMinute > 0 && __classPrivateFieldGet2(this, _BatchCluster_startErrorRate, "f").eventsPerMinute > this.options.maxReasonableProcessFailuresPerMinute) {
          this.emitter.emit("fatalError", new Error(error + "(start errors/min: " + __classPrivateFieldGet2(this, _BatchCluster_startErrorRate, "f").eventsPerMinute.toFixed(2) + ")"));
          this.end();
        } else {
          __classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f").call(this);
        }
      });
      if (this.options.onIdleIntervalMillis > 0) {
        __classPrivateFieldSet2(this, _BatchCluster_onIdleInterval, node_timers_12.default.setInterval(() => __classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f").call(this), this.options.onIdleIntervalMillis), "f");
        __classPrivateFieldGet2(this, _BatchCluster_onIdleInterval, "f").unref();
      }
      __classPrivateFieldSet2(this, _BatchCluster_logger, this.options.logger, "f");
      node_process_12.default.once("beforeExit", __classPrivateFieldGet2(this, _BatchCluster_beforeExitListener, "f"));
      node_process_12.default.once("exit", __classPrivateFieldGet2(this, _BatchCluster_exitListener, "f"));
    }
    get ended() {
      return __classPrivateFieldGet2(this, _BatchCluster_endPromise, "f") != null;
    }
    /**
     * Shut down this instance, and all child processes.
     * @param gracefully should an attempt be made to finish in-flight tasks, or
     * should we force-kill child PIDs.
     */
    // NOT ASYNC so state transition happens immediately
    end(gracefully = true) {
      __classPrivateFieldGet2(this, _BatchCluster_logger, "f").call(this).info("BatchCluster.end()", { gracefully });
      if (__classPrivateFieldGet2(this, _BatchCluster_endPromise, "f") == null) {
        this.emitter.emit("beforeEnd");
        (0, Object_12.map)(__classPrivateFieldGet2(this, _BatchCluster_onIdleInterval, "f"), node_timers_12.default.clearInterval);
        __classPrivateFieldSet2(this, _BatchCluster_onIdleInterval, void 0, "f");
        node_process_12.default.removeListener("beforeExit", __classPrivateFieldGet2(this, _BatchCluster_beforeExitListener, "f"));
        node_process_12.default.removeListener("exit", __classPrivateFieldGet2(this, _BatchCluster_exitListener, "f"));
        __classPrivateFieldSet2(this, _BatchCluster_endPromise, new Deferred_12.Deferred().observe(this.closeChildProcesses(gracefully).then(() => {
          this.emitter.emit("end");
        })), "f");
      }
      return __classPrivateFieldGet2(this, _BatchCluster_endPromise, "f");
    }
    /**
     * Submits `task` for processing by a `BatchProcess` instance
     *
     * @return a Promise that is resolved or rejected once the task has been
     * attempted on an idle BatchProcess
     */
    enqueueTask(task) {
      if (this.ended) {
        task.reject(new Error("BatchCluster has ended, cannot enqueue " + task.command));
      }
      __classPrivateFieldGet2(this, _BatchCluster_tasks, "f").push(task);
      __classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f").call(this);
      return task.promise;
    }
    /**
     * @return true if all previously-enqueued tasks have settled
     */
    get isIdle() {
      return this.pendingTaskCount === 0 && this.busyProcCount === 0;
    }
    /**
     * @return the number of pending tasks
     */
    get pendingTaskCount() {
      return __classPrivateFieldGet2(this, _BatchCluster_tasks, "f").length;
    }
    /**
     * @returns {number} the mean number of tasks completed by child processes
     */
    get meanTasksPerProc() {
      return __classPrivateFieldGet2(this, _BatchCluster_tasksPerProc, "f").mean;
    }
    /**
     * @return the total number of child processes created by this instance
     */
    get spawnedProcCount() {
      return __classPrivateFieldGet2(this, _BatchCluster_spawnedProcs, "f");
    }
    /**
     * @return the current number of spawned child processes. Some (or all) may be idle.
     */
    get procCount() {
      return __classPrivateFieldGet2(this, _BatchCluster_procs, "f").length;
    }
    /**
     * @return the current number of child processes currently servicing tasks
     */
    get busyProcCount() {
      return (0, Array_12.count)(
        __classPrivateFieldGet2(this, _BatchCluster_procs, "f"),
        // don't count procs that are starting up as "busy":
        (ea) => !ea.starting && !ea.ending && !ea.idle
      );
    }
    get startingProcCount() {
      return (0, Array_12.count)(
        __classPrivateFieldGet2(this, _BatchCluster_procs, "f"),
        // don't count procs that are starting up as "busy":
        (ea) => ea.starting && !ea.ending
      );
    }
    /**
     * @return the current pending Tasks (mostly for testing)
     */
    get pendingTasks() {
      return __classPrivateFieldGet2(this, _BatchCluster_tasks, "f");
    }
    /**
     * @return the current running Tasks (mostly for testing)
     */
    get currentTasks() {
      return __classPrivateFieldGet2(this, _BatchCluster_procs, "f").map((ea) => ea.currentTask).filter((ea) => ea != null);
    }
    /**
     * For integration tests:
     */
    get internalErrorCount() {
      return __classPrivateFieldGet2(this, _BatchCluster_internalErrorCount, "f");
    }
    /**
     * Verify that each BatchProcess PID is actually alive.
     *
     * @return the spawned PIDs that are still in the process table.
     */
    pids() {
      const arr = [];
      for (const proc of [...__classPrivateFieldGet2(this, _BatchCluster_procs, "f")]) {
        if (proc != null && proc.running()) {
          arr.push(proc.pid);
        }
      }
      return arr;
    }
    /**
     * For diagnostics. Contents may change.
     */
    stats() {
      var _a2;
      const readyProcCount = (0, Array_12.count)(__classPrivateFieldGet2(this, _BatchCluster_procs, "f"), (ea) => ea.ready);
      return {
        pendingTaskCount: __classPrivateFieldGet2(this, _BatchCluster_tasks, "f").length,
        currentProcCount: __classPrivateFieldGet2(this, _BatchCluster_procs, "f").length,
        readyProcCount,
        maxProcCount: this.options.maxProcs,
        internalErrorCount: __classPrivateFieldGet2(this, _BatchCluster_internalErrorCount, "f"),
        startErrorRatePerMinute: __classPrivateFieldGet2(this, _BatchCluster_startErrorRate, "f").eventsPerMinute,
        msBeforeNextSpawn: Math.max(0, __classPrivateFieldGet2(this, _BatchCluster_nextSpawnTime, "f") - Date.now()),
        spawnedProcCount: this.spawnedProcCount,
        childEndCounts: this.childEndCounts,
        ending: __classPrivateFieldGet2(this, _BatchCluster_endPromise, "f") != null,
        ended: false === ((_a2 = __classPrivateFieldGet2(this, _BatchCluster_endPromise, "f")) === null || _a2 === void 0 ? void 0 : _a2.pending)
      };
    }
    /**
     * Get ended process counts (used for tests)
     */
    countEndedChildProcs(why) {
      var _a2;
      return (_a2 = __classPrivateFieldGet2(this, _BatchCluster_childEndCounts, "f").get(why)) !== null && _a2 !== void 0 ? _a2 : 0;
    }
    get childEndCounts() {
      return (0, Object_12.fromEntries)([...__classPrivateFieldGet2(this, _BatchCluster_childEndCounts, "f").entries()]);
    }
    /**
     * Shut down any currently-running child processes. New child processes will
     * be started automatically to handle new tasks.
     */
    async closeChildProcesses(gracefully = true) {
      const procs = [...__classPrivateFieldGet2(this, _BatchCluster_procs, "f")];
      __classPrivateFieldGet2(this, _BatchCluster_procs, "f").length = 0;
      await Promise.all(procs.map((proc) => proc.end(gracefully, "ending").catch((err) => this.emitter.emit("endError", (0, Error_12.asError)(err), proc))));
    }
    /**
     * Reset the maximum number of active child processes to `maxProcs`. Note that
     * this is handled gracefully: child processes are only reduced as tasks are
     * completed.
     */
    setMaxProcs(maxProcs) {
      this.options.maxProcs = maxProcs;
      __classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f").call(this);
    }
    /**
     * Run maintenance on currently spawned child processes. This method is
     * normally invoked automatically as tasks are enqueued and processed.
     *
     * Only public for tests.
     */
    // NOT ASYNC: updates internal state. only exported for tests.
    vacuumProcs() {
      __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_maybeCheckPids).call(this);
      const endPromises = [];
      let pidsToReap = Math.max(0, __classPrivateFieldGet2(this, _BatchCluster_procs, "f").length - this.options.maxProcs);
      (0, Array_12.filterInPlace)(__classPrivateFieldGet2(this, _BatchCluster_procs, "f"), (proc) => {
        var _a2;
        if (proc.idle) {
          const why = (_a2 = proc.whyNotHealthy) !== null && _a2 !== void 0 ? _a2 : --pidsToReap >= 0 ? "tooMany" : null;
          if (why != null) {
            endPromises.push(proc.end(true, why));
            return false;
          }
          proc.maybeRunHealthcheck();
        }
        return true;
      });
      return Promise.all(endPromises);
    }
  }
  exports2.BatchCluster = BatchCluster2;
  _BatchCluster_tasksPerProc = /* @__PURE__ */ new WeakMap(), _BatchCluster_logger = /* @__PURE__ */ new WeakMap(), _BatchCluster_procs = /* @__PURE__ */ new WeakMap(), _BatchCluster_onIdleRequested = /* @__PURE__ */ new WeakMap(), _BatchCluster_nextSpawnTime = /* @__PURE__ */ new WeakMap(), _BatchCluster_lastPidsCheckTime = /* @__PURE__ */ new WeakMap(), _BatchCluster_tasks = /* @__PURE__ */ new WeakMap(), _BatchCluster_onIdleInterval = /* @__PURE__ */ new WeakMap(), _BatchCluster_startErrorRate = /* @__PURE__ */ new WeakMap(), _BatchCluster_spawnedProcs = /* @__PURE__ */ new WeakMap(), _BatchCluster_endPromise = /* @__PURE__ */ new WeakMap(), _BatchCluster_internalErrorCount = /* @__PURE__ */ new WeakMap(), _BatchCluster_childEndCounts = /* @__PURE__ */ new WeakMap(), _BatchCluster_beforeExitListener = /* @__PURE__ */ new WeakMap(), _BatchCluster_exitListener = /* @__PURE__ */ new WeakMap(), _BatchCluster_onIdleLater = /* @__PURE__ */ new WeakMap(), _BatchCluster_instances = /* @__PURE__ */ new WeakSet(), _BatchCluster_onIdle = function _BatchCluster_onIdle2() {
    __classPrivateFieldSet2(this, _BatchCluster_onIdleRequested, false, "f");
    this.vacuumProcs();
    while (__classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_execNextTask).call(this)) {
    }
    __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_maybeSpawnProcs).call(this);
  }, _BatchCluster_maybeCheckPids = function _BatchCluster_maybeCheckPids2() {
    if (this.options.cleanupChildProcs && this.options.pidCheckIntervalMillis > 0 && __classPrivateFieldGet2(this, _BatchCluster_lastPidsCheckTime, "f") + this.options.pidCheckIntervalMillis < Date.now()) {
      __classPrivateFieldSet2(this, _BatchCluster_lastPidsCheckTime, Date.now(), "f");
      void this.pids();
    }
  }, _BatchCluster_execNextTask = function _BatchCluster_execNextTask2(retries = 1) {
    if (__classPrivateFieldGet2(this, _BatchCluster_tasks, "f").length === 0 || this.ended || retries < 0)
      return false;
    const readyProc = __classPrivateFieldGet2(this, _BatchCluster_procs, "f").find((ea) => ea.ready);
    if (readyProc == null) {
      return false;
    }
    const task = __classPrivateFieldGet2(this, _BatchCluster_tasks, "f").shift();
    if (task == null) {
      this.emitter.emit("internalError", new Error("unexpected null task"));
      return false;
    }
    const submitted = readyProc.execTask(task);
    if (!submitted) {
      __classPrivateFieldGet2(this, _BatchCluster_tasks, "f").push(task);
      return __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_execNextTask2).call(this, retries--);
    }
    __classPrivateFieldGet2(this, _BatchCluster_logger, "f").call(this).trace("BatchCluster.#execNextTask(): submitted task", {
      child_pid: readyProc.pid,
      task
    });
    return submitted;
  }, _BatchCluster_maxSpawnDelay = function _BatchCluster_maxSpawnDelay2() {
    return Math.max(1e4, this.options.spawnTimeoutMillis);
  }, _BatchCluster_procsToSpawn = function _BatchCluster_procsToSpawn2() {
    const remainingCapacity = this.options.maxProcs - __classPrivateFieldGet2(this, _BatchCluster_procs, "f").length;
    const requestedCapacity = __classPrivateFieldGet2(this, _BatchCluster_tasks, "f").length - this.startingProcCount;
    const atLeast0 = Math.max(0, Math.min(remainingCapacity, requestedCapacity));
    return this.options.minDelayBetweenSpawnMillis === 0 ? (
      // we can spin up multiple processes in parallel.
      atLeast0
    ) : (
      // Don't spin up more than 1:
      Math.min(1, atLeast0)
    );
  }, _BatchCluster_maybeSpawnProcs = async function _BatchCluster_maybeSpawnProcs2() {
    var _a2;
    let procsToSpawn = __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_procsToSpawn).call(this);
    if (this.ended || __classPrivateFieldGet2(this, _BatchCluster_nextSpawnTime, "f") > Date.now() || procsToSpawn === 0) {
      return;
    }
    __classPrivateFieldSet2(this, _BatchCluster_nextSpawnTime, Date.now() + __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_maxSpawnDelay).call(this), "f");
    for (let i = 0; i < procsToSpawn; i++) {
      if (this.ended) {
        break;
      }
      __classPrivateFieldSet2(this, _BatchCluster_nextSpawnTime, Date.now() + __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_maxSpawnDelay).call(this), "f");
      __classPrivateFieldSet2(this, _BatchCluster_spawnedProcs, (_a2 = __classPrivateFieldGet2(this, _BatchCluster_spawnedProcs, "f"), _a2++, _a2), "f");
      try {
        const proc = __classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_spawnNewProc).call(this);
        const result = await (0, Timeout_12.thenOrTimeout)(proc, this.options.spawnTimeoutMillis);
        if (result === Timeout_12.Timeout) {
          void proc.then((bp) => {
            void bp.end(false, "startError");
            this.emitter.emit("startError", (0, Error_12.asError)("Failed to spawn process in " + this.options.spawnTimeoutMillis + "ms"), bp);
          }).catch((err) => {
            this.emitter.emit("startError", (0, Error_12.asError)(err));
          });
        } else {
          __classPrivateFieldGet2(this, _BatchCluster_logger, "f").call(this).debug("BatchCluster.#maybeSpawnProcs() started healthy child process", { pid: result.pid });
        }
        procsToSpawn = Math.min(__classPrivateFieldGet2(this, _BatchCluster_instances, "m", _BatchCluster_procsToSpawn).call(this), procsToSpawn);
      } catch (err) {
        this.emitter.emit("startError", (0, Error_12.asError)(err));
      }
    }
    const delay2 = Math.max(100, this.options.minDelayBetweenSpawnMillis);
    __classPrivateFieldSet2(this, _BatchCluster_nextSpawnTime, Date.now() + delay2, "f");
    node_timers_12.default.setTimeout(__classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f"), delay2).unref();
  }, _BatchCluster_spawnNewProc = // must only be called by this.#maybeSpawnProcs()
  async function _BatchCluster_spawnNewProc2() {
    const proc = await this.options.processFactory();
    const result = new BatchProcess_1.BatchProcess(proc, this.options, __classPrivateFieldGet2(this, _BatchCluster_onIdleLater, "f"));
    __classPrivateFieldGet2(this, _BatchCluster_procs, "f").push(result);
    return result;
  };
})(BatchCluster);
var _Array = {};
var _String = {};
var _Number = {};
Object.defineProperty(_Number, "__esModule", { value: true });
_Number.isNumber = isNumber$1;
_Number.toFloat = toFloat;
_Number.toInt = toInt;
_Number.roundToDecimalPlaces = roundToDecimalPlaces;
function isNumber$1(n2) {
  return typeof n2 === "number" && isFinite(n2);
}
function toFloat(n2) {
  if (n2 == null)
    return;
  if (isNumber$1(n2))
    return n2;
  try {
    return parseFloat(String(n2).trim());
  } catch {
    return void 0;
  }
}
function toInt(n2) {
  if (n2 == null)
    return;
  if (isNumber$1(n2)) {
    return Math.floor(n2);
  }
  try {
    return parseInt(String(n2).trim());
  } catch {
    return void 0;
  }
}
function roundToDecimalPlaces(value, precision) {
  if (!isNumber$1(value))
    throw new Error("Value must be a number");
  if (precision < 0)
    throw new Error("Precision must be non-negative");
  if (value === 0)
    return 0;
  const multiplier = Math.pow(10, precision);
  return Math.abs(value) < Number.EPSILON ? 0 : Math.round(value * multiplier) / multiplier;
}
var Times = {};
Object.defineProperty(Times, "__esModule", { value: true });
Times.times = times;
function times(n2, f) {
  return Array.from({ length: n2 }, (_, i) => f(i));
}
Object.defineProperty(_String, "__esModule", { value: true });
_String.isString = isString$1;
_String.blank = blank;
_String.notBlank = notBlank;
_String.notBlankString = notBlankString;
_String.toNotBlank = toNotBlank;
_String.compactBlanks = compactBlanks;
_String.toS = toS;
_String.leftPad = leftPad;
_String.pad2 = pad2;
_String.pad3 = pad3;
_String.stripPrefix = stripPrefix;
_String.stripSuffix = stripSuffix;
_String.splitLines = splitLines;
const Number_1$3 = _Number;
const Times_1 = Times;
function isString$1(o) {
  return typeof o === "string";
}
const spaces = (0, Times_1.times)(10, (i) => (0, Times_1.times)(i, () => " ").join(""));
const zeroes = (0, Times_1.times)(10, (i) => (0, Times_1.times)(i, () => "0").join(""));
function blank(s2) {
  return s2 == null || String(s2).trim().length === 0;
}
function notBlank(s2) {
  return !blank(s2);
}
function notBlankString(s2) {
  return isString$1(s2) && s2.trim().length > 0;
}
function toNotBlank(s2) {
  if (s2 == null)
    return;
  s2 = String(s2).trim();
  return s2.length === 0 ? void 0 : s2;
}
function compactBlanks(arr) {
  return arr.filter(notBlank);
}
function padding(padChar, count2) {
  if (count2 <= 0)
    return "";
  return (padChar === "0" ? zeroes : spaces)[Math.floor(count2)];
}
function toS(s2) {
  return s2 == null ? "" : String(s2);
}
function leftPad(i, minLen, padChar) {
  if (i == null || (0, Number_1$3.isNumber)(i) && isNaN(i))
    i = 0;
  const s2 = String(i);
  if ((0, Number_1$3.isNumber)(i) && i < 0 && padChar === "0") {
    return "-" + padding(padChar, minLen - s2.length) + Math.abs(i);
  } else {
    return padding(padChar, minLen - s2.length) + s2;
  }
}
function pad2(...numbers) {
  return numbers.map((i) => leftPad(i, 2, "0"));
}
function pad3(...numbers) {
  return numbers.map((i) => leftPad(i, 3, "0"));
}
function stripPrefix(s2, prefix) {
  return toS(s2).toLowerCase().startsWith(prefix.toLowerCase()) ? s2.slice(prefix.length) : s2;
}
function stripSuffix(s2, suffix) {
  const str = toS(s2);
  return str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
}
function splitLines(...arr) {
  return arr.join("\n").split(/\r?\n/).map((ea) => ea.trim()).filter((ea) => ea.length > 0);
}
Object.defineProperty(_Array, "__esModule", { value: true });
_Array.isIterable = isIterable;
_Array.ifArr = ifArr;
_Array.toA = toA;
_Array.compact = compact;
_Array.filterInPlace = filterInPlace;
_Array.uniq = uniq;
_Array.shallowArrayEql = shallowArrayEql;
_Array.sortBy = sortBy;
_Array.leastBy = leastBy;
const String_1$7 = _String;
function isIterable(obj) {
  return obj != null && typeof obj !== "string" && typeof obj[Symbol.iterator] === "function";
}
function ifArr(arr) {
  return Array.isArray(arr) ? arr : void 0;
}
function toA(arr) {
  return Array.isArray(arr) ? arr : arr == null ? [] : (0, String_1$7.isString)(arr) ? [arr] : isIterable(arr) ? Array.from(arr) : [arr];
}
function compact(array) {
  return array.filter((elem) => elem != null);
}
function filterInPlace(arr, filter) {
  let j = 0;
  arr.forEach((ea, i) => {
    if (filter(ea)) {
      if (i !== j)
        arr[j] = ea;
      j++;
    }
  });
  arr.length = j;
  return arr;
}
function uniq(arr) {
  return arr.reduce((acc, ea) => {
    if (acc.indexOf(ea) === -1)
      acc.push(ea);
    return acc;
  }, []);
}
function shallowArrayEql(a, b) {
  return a != null && b != null && a.length === b.length && a.every((ea, idx) => ea === b[idx]);
}
function sortBy(arr, f) {
  return toA(arr).filter((ea) => ea != null).map((item) => ({
    item,
    cmp: f(item)
  })).filter((ea) => ea.cmp != null).sort((a, b) => cmp(a.cmp, b.cmp)).map((ea) => ea.item);
}
function cmp(a, b) {
  if (a == null && b == null)
    return 0;
  if (a == null)
    return -1;
  if (b == null)
    return 1;
  const aType = typeof a;
  const bType = typeof b;
  if ((aType === "string" || aType === "symbol") && (bType === "string" || bType === "symbol")) {
    return String(a).localeCompare(String(b));
  }
  return a > b ? 1 : a < b ? -1 : 0;
}
function leastBy(haystack, f) {
  let min;
  let result;
  for (const ea of haystack) {
    const val = f(ea);
    if (val != null && (min == null || val < min)) {
      min = val;
      result = ea;
    }
  }
  return result;
}
var AsyncRetry = {};
Object.defineProperty(AsyncRetry, "__esModule", { value: true });
AsyncRetry.retryOnReject = retryOnReject;
function retryOnReject(f, maxRetries) {
  let retries = 0;
  const g = async () => {
    try {
      return await f();
    } catch (err) {
      if (retries < maxRetries) {
        retries++;
        return g();
      } else {
        throw err;
      }
    }
  };
  return g();
}
var BinaryExtractionTask$1 = {};
var ExifToolTask$1 = {};
var IsWarning = {};
Object.defineProperty(IsWarning, "__esModule", { value: true });
IsWarning.isWarning = isWarning;
const String_1$6 = _String;
const WarningRE = /\bwarning: |\bnothing to (?:write|do)\b/i;
function isWarning(err) {
  if (err == null)
    return true;
  const msg = (err instanceof Error ? err.message : (0, String_1$6.toS)(err)).trim();
  return (0, String_1$6.blank)(msg) || WarningRE.test(msg);
}
var __createBinding$5 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$5 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$5 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$5(result, mod, k);
  }
  __setModuleDefault$5(result, mod);
  return result;
};
Object.defineProperty(ExifToolTask$1, "__esModule", { value: true });
ExifToolTask$1.ExifToolTask = void 0;
const bc = __importStar$5(BatchCluster);
const IsWarning_1 = IsWarning;
const String_1$5 = _String;
const BadPerlInstallationRE = /Can't locate \S+ in @INC/i;
const _ExifToolTask = class _ExifToolTask extends bc.Task {
  constructor(args, options) {
    super(_ExifToolTask.renderCommand(args, options), (stdout, stderr, passed) => __privateMethod(this, _ExifToolTask_instances, parser_fn).call(this, stdout, stderr, passed));
    __privateAdd(this, _ExifToolTask_instances);
    __publicField(this, "args");
    __publicField(this, "options");
    __publicField(this, "errors", []);
    __publicField(this, "warnings", []);
    this.args = args;
    this.options = options;
  }
  static renderCommand(args, options) {
    const result = args.filter((ea) => !(0, String_1$5.blank)(ea));
    if ((options == null ? void 0 : options.ignoreMinorErrors) === true) {
      result.push("-ignoreMinorErrors");
    }
    result.push("-execute");
    return result.join("\n") + "\n";
  }
  onStderr(buf) {
    if (BadPerlInstallationRE.test(buf.toString())) {
      throw new Error(buf.toString());
    }
    super.onStderr(buf);
  }
};
_ExifToolTask_instances = new WeakSet();
parser_fn = function(stdout, stderr, passed) {
  let error;
  if ((0, String_1$5.notBlank)(stderr) || !passed) {
    for (const line of (0, String_1$5.splitLines)(stderr ?? "")) {
      if ((0, IsWarning_1.isWarning)(line)) {
        this.warnings.push(line);
      } else if (/error|warning/i.test(line)) {
        this.errors.push(line);
        error ?? (error = new Error(line.replace(/^error: /i, "")));
      }
    }
  }
  return this.parse(stdout, error);
};
let ExifToolTask = _ExifToolTask;
ExifToolTask$1.ExifToolTask = ExifToolTask;
var FilenameCharsetArgs = {};
var IsWin32 = {};
var Lazy = {};
Object.defineProperty(Lazy, "__esModule", { value: true });
Lazy.lazy = lazy;
function lazy(thunk) {
  let invoked = false;
  let result;
  let error;
  return () => {
    if (!invoked) {
      try {
        invoked = true;
        result = thunk();
      } catch (e) {
        error = e;
        throw e;
      }
    }
    if (error != null)
      throw error;
    return result;
  };
}
var __createBinding$4 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$4 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$4 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$4(result, mod, k);
  }
  __setModuleDefault$4(result, mod);
  return result;
};
Object.defineProperty(IsWin32, "__esModule", { value: true });
IsWin32.isWin32 = void 0;
const _os$1 = __importStar$4(require$$0$1);
const Lazy_1 = Lazy;
IsWin32.isWin32 = (0, Lazy_1.lazy)(() => _os$1.platform() === "win32");
Object.defineProperty(FilenameCharsetArgs, "__esModule", { value: true });
FilenameCharsetArgs.Utf8FilenameCharsetArgs = void 0;
const IsWin32_1$2 = IsWin32;
FilenameCharsetArgs.Utf8FilenameCharsetArgs = (0, IsWin32_1$2.isWin32)() ? ["-charset", "filename=utf8"] : [];
var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(BinaryExtractionTask$1, "__esModule", { value: true });
BinaryExtractionTask$1.BinaryExtractionTask = void 0;
const node_path_1$2 = __importDefault$2(require$$1$1);
const ExifToolTask_1$4 = ExifToolTask$1;
const FilenameCharsetArgs_1$3 = FilenameCharsetArgs;
const String_1$4 = _String;
const StdoutRe = /\b(\d+) output files? created/i;
class BinaryExtractionTask extends ExifToolTask_1$4.ExifToolTask {
  constructor(args, options) {
    super(args, options);
  }
  static for(tagname, imgSrc, imgDest, options) {
    const args = [
      ...FilenameCharsetArgs_1$3.Utf8FilenameCharsetArgs,
      "-b",
      "-" + tagname,
      "-w",
      // The %0f prevents shell escaping. See
      // https://exiftool.org/exiftool_pod.html#w-EXT-or-FMT--textOut
      "%0f" + node_path_1$2.default.resolve(imgDest),
      node_path_1$2.default.resolve(imgSrc)
    ];
    return new BinaryExtractionTask(args, options);
  }
  parse(stdout, err) {
    const s2 = (0, String_1$4.toS)(stdout).trim();
    const m = StdoutRe.exec(s2);
    if (err != null) {
      throw err;
    } else if (m == null) {
      throw new Error("Missing expected status message (got " + stdout + ")");
    } else if (m[1] === "1") {
      return;
    } else {
      return s2;
    }
  }
}
BinaryExtractionTask$1.BinaryExtractionTask = BinaryExtractionTask;
var BinaryToBufferTask$1 = {};
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(BinaryToBufferTask$1, "__esModule", { value: true });
BinaryToBufferTask$1.BinaryToBufferTask = void 0;
const node_path_1$1 = __importDefault$1(require$$1$1);
const ExifToolTask_1$3 = ExifToolTask$1;
const FilenameCharsetArgs_1$2 = FilenameCharsetArgs;
const String_1$3 = _String;
class BinaryToBufferTask extends ExifToolTask_1$3.ExifToolTask {
  constructor(tagname, args, options) {
    super(args, options);
    __publicField(this, "tagname");
    this.tagname = tagname;
  }
  static for(tagname, imgSrc, options) {
    const args = [...FilenameCharsetArgs_1$2.Utf8FilenameCharsetArgs, "-json", "-b", "-" + tagname];
    args.push(node_path_1$1.default.resolve(imgSrc));
    return new BinaryToBufferTask(tagname, args, options);
  }
  parse(data, err) {
    var _a2;
    try {
      const obj = (_a2 = JSON.parse(data)) == null ? void 0 : _a2[0];
      {
        const result = decode(obj[this.tagname]);
        if (result != null)
          return result;
      }
      for (const k of Object.keys(obj)) {
        if (k.toLowerCase() === this.tagname.toLowerCase()) {
          const result = decode(obj[k]);
          if (result != null)
            return result;
        }
      }
    } catch (caught) {
      err ?? (err = (0, String_1$3.notBlank)(data) ? new Error(data) : caught instanceof Error ? caught : new Error(String(caught)));
    }
    return err ?? new Error(this.tagname + " not found");
  }
}
BinaryToBufferTask$1.BinaryToBufferTask = BinaryToBufferTask;
const B64Prefix = "base64:";
function decode(data) {
  return data == null || !data.startsWith(B64Prefix) ? void 0 : Buffer.from(data.substring(B64Prefix.length), "base64");
}
var DefaultExifToolOptions = {};
var _Boolean = {};
Object.defineProperty(_Boolean, "__esModule", { value: true });
_Boolean.toBoolean = toBoolean;
const Truthy = ["true", "yes", "1", "on"];
const Falsy = ["false", "no", "0", "off"];
function toBoolean(value) {
  if (value == null)
    return void 0;
  if (typeof value === "boolean")
    return value;
  const s2 = String(value).trim().toLowerCase();
  return Truthy.includes(s2) ? true : Falsy.includes(s2) ? false : void 0;
}
var CapturedAtTagNames = {};
Object.defineProperty(CapturedAtTagNames, "__esModule", { value: true });
CapturedAtTagNames.CapturedAtTagNames = void 0;
CapturedAtTagNames.CapturedAtTagNames = [
  "SubSecDateTimeOriginal",
  "SubSecCreateDate",
  "SubSecMediaCreateDate",
  "DateTimeOriginal",
  "CreateDate",
  "MediaCreateDate",
  "CreationDate",
  // < Found in some transcoded Apple movies
  "DateTimeCreated",
  "TimeCreated"
  // < may not have the date
];
var DefaultExiftoolArgs = {};
Object.defineProperty(DefaultExiftoolArgs, "__esModule", { value: true });
DefaultExiftoolArgs.DefaultExiftoolArgs = void 0;
DefaultExiftoolArgs.DefaultExiftoolArgs = ["-stay_open", "True", "-@", "-"];
var DefaultMaxProcs = {};
var __createBinding$3 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$3 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$3 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$3(result, mod, k);
  }
  __setModuleDefault$3(result, mod);
  return result;
};
Object.defineProperty(DefaultMaxProcs, "__esModule", { value: true });
DefaultMaxProcs.DefaultMaxProcs = void 0;
const _os = __importStar$3(require$$0$1);
DefaultMaxProcs.DefaultMaxProcs = Math.max(1, Math.floor(_os.cpus().length / 4));
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ExiftoolPath = {};
var Which = {};
Object.defineProperty(Which, "__esModule", { value: true });
Which.which = which;
const node_fs_1 = require$$0$5;
const promises_1 = require$$1$2;
const node_path_1 = require$$1$1;
const node_process_1 = require$$1;
const IsWin32_1$1 = IsWin32;
const String_1$2 = _String;
async function which(binaryOrPath) {
  if ((0, node_path_1.isAbsolute)(binaryOrPath) && await canRX(binaryOrPath)) {
    return binaryOrPath;
  }
  const base = (0, node_path_1.basename)(binaryOrPath);
  for (const dir of (0, String_1$2.toS)(node_process_1.env.PATH).split(node_path_1.delimiter)) {
    const fullPath = (0, node_path_1.join)(dir, base);
    if (await canRX(fullPath)) {
      return fullPath;
    }
  }
  return;
}
async function canRX(fullpath) {
  if ((0, IsWin32_1$1.isWin32)())
    return (0, node_fs_1.existsSync)(fullpath);
  try {
    await (0, promises_1.access)(fullpath, node_fs_1.constants.R_OK | node_fs_1.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
var __createBinding$2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$2(result, mod, k);
  }
  __setModuleDefault$2(result, mod);
  return result;
};
Object.defineProperty(ExiftoolPath, "__esModule", { value: true });
ExiftoolPath.exiftoolPath = exiftoolPath;
const _fs = __importStar$2(require$$0$5);
const _path$2 = __importStar$2(require$$1$1);
const IsWin32_1 = IsWin32;
const Which_1 = Which;
function vendorPackage() {
  return "exiftool-vendored." + ((0, IsWin32_1.isWin32)() ? "exe" : "pl");
}
function tryRequire({ prefix = "", logger } = {}) {
  const id = prefix + vendorPackage();
  try {
    return commonjsRequire(id);
  } catch (error) {
    logger == null ? void 0 : logger.warn(id + "not found: ", error);
    return;
  }
}
async function exiftoolPath(logger) {
  const path2 = tryRequire({ prefix: "", logger });
  const asarUnpackedPath = path2 == null ? void 0 : path2.split(_path$2.sep).map((ea) => ea === "app.asar" ? "app.asar.unpacked" : ea).join(_path$2.sep);
  if (asarUnpackedPath != null && _fs.existsSync(asarUnpackedPath)) {
    return asarUnpackedPath;
  }
  if (path2 != null && _fs.existsSync(path2)) {
    return path2;
  }
  logger == null ? void 0 : logger.warn("Failed to find exiftool via " + vendorPackage());
  const electronResourcePath = process.resourcesPath;
  if (electronResourcePath != null) {
    const forgePath = _path$2.join(electronResourcePath, vendorPackage(), "bin", "exiftool" + ((0, IsWin32_1.isWin32)() ? ".exe" : ""));
    if (_fs.existsSync(forgePath)) {
      return forgePath;
    } else {
      logger == null ? void 0 : logger.warn("Failed to find exiftool in electron forge resources path: " + forgePath);
    }
  }
  const fromPath = await (0, Which_1.which)("exiftool");
  if (fromPath != null) {
    return fromPath;
  }
  throw new Error(`Failed to find ExifTool installation: set exiftoolPath explicitly.`);
}
var GeoTz = {};
var tz = { exports: {} };
(function(module2) {
  function tzlookup(Y, W) {
    var X = "XKXJXJXIXIXSXSXRXRXQXQXP##U;U;U;#$UZUZUZUZUZXHXGXGXTXTXXXXXYXYXZXZY#Y#Y$Y$Y%Y%Y&Y&Y'Y'XUXUXVXVXWXKXJXJXIXIXSXSU:U$#%#&V,#'U;#(#)UZUZUZUZUZ#*UZXGXGVPVPVPVPYIYIYIYI#+W@W@W@W@W@W@Y&X/X/X/X/X/XVXWVTUV#,T-T-#-U:U:#.#/#0#1#2U;U;U;UZUZUZUZ#3#4YJYJXGYJ#5#6#7YIYIYI#8X1#9W@W@W@#:X/X/#;#<#=#>#?VTVT#@#A#BT-T-#C#D#E#F#G#HV,#I#J#K#LUZUZUZUZX9X9#M#NYJ#O#P#Q#RYI#S#T#UX1#V#WW@W@#X#YX/#Z$#$$$%$&$'$($)$*$+T-T-$,$-$.U$$/$0$1$2$3$4$5$6UZUZXLXLXH$7$8$9$:$;$<$=YI$>$?$@$A$B$C$D$EW6$F$G$H$I$J$KW;$LT,T,T,XJXIXIXSVB$M$N$O$P$Q$R$S$T$U$VV7XMXLXLXHY6$W$X$Y$Z%#%$%%%&%'%(VR%)%*%+%,%-%.%/%0%1%2%3W;XVT,XKXJXJXIXIXSXSUC%4%5%6TO%7%8%9%:U0XMXMX3X3XH%;%<%=%>%?%@%A%B%C%D%E%F%GX+%H%I%JWX%K%L%M%NXUXVXVXWXKXJXJXIXIXSXSUC%O%P%QTO%RUUXOX4XNXMXMXLX3X8%S%TS3%U%V%W%X%Y%Z&#&$&%&&WXWXWXWXWX&'&(X(XUXUXVXVXW&)ZCZCXIXIXSXSXR&*&+&,&-&.&/UTXNXNXMXMXLXL&0&1&2S3&3T)&4&5WT&6&7&8&9&:&;&<&=&>&?&@X(X(XUX(XVXVXWXKZCZCZCXIXSXSXRUK&A&B&C&D&E&F&GXNXMXMXLX6&H&I&J&K&L&M&N&O&P&Q&RWHW?W?&S&T&U&V&W&XY'X(ZUXUXVZYXWXKXJXJXIXIXSXSXRXRXQXQ&Y&Z'#'$'%'&XMXMXLX6'''(')'*'+','-'.'/'0VQXZW?'1Y$'2'3'4'5WGZPZ9'6'7ZH'8XWXKXJZEZEXIXSXSXRXRXQXQZ?'9':';'<'='>XMXLUWXH'?'@'A'B'C'D'E'F'GXZXZZ1W*Y$'H'I'J'K'L'MW8Z9'N'O'PZWZDZDXJZEXIXSXSXRXRXQXQZ?'Q'R'SUG'T'U'V'WXLXHXHXGST'X'Y'Z(#($XYZ0XZ(%Y#Y$Y$W7(&('((W8()ZS(*ZA(+(,(-(.ZTZE(/(0XSXRXRXQXQXPUBUB(1(2(3(4(5(6XLXHX;XGXGSQ(7(8(9(:(;Z2XZY#Y#Y$Z-Y%(<(=(>(?(@(A(BZA(C(D(EZLZT(FZV(GXSXRXRXQXQXPXPUB(H(I(J(K(LXLV3XHXHX;XG(M(N(O(P(QZ*(RZ2Y#Y#Y$Y$Y%Y%XEXE(S(TX>X>ZN(UZ=(VXJXJZVZVZ@(WZQXRZ:XQXPXPV1(X(Y(ZV3V3XLXLXHXHXGXGT+)#)$)%Z*Z*XZXZY#Y#Y$Y$Y%Y%XEXE)&)')())XV)*XWZ6XJXJXIXIXSXSXRXRXQXQXPXPV1)+),)-V3XMXLXLXHX;XGXGXTSH).SHXYXYXZXZY#Y#Y$Y$Y%Y%XE)/)0)1)2XFXCZ6Z6Z8XJXJXIXIXSXSXRXRXQXQXPXPV1)3)4T1XMXMXLXLXHX;XGXGXTXTXXXXXYXYXZXZY#Z/Y$Y$Y%Y%Y&Y&Y')5)6XDXVZ6Z6XKXJXJXIXIXSXSXRXRXQXQXPXP)7)8)9X<XMXMXLXLXHXHXGXGXTXTXXSHSHZ/Z/XZZ/Y#Y$Y$Y%Y%Y&Y&Y'Y'XUXUXVZ6Z6XKXJXJXIXIXSXSXRXRXQXQXPXPV+):);X<XMX:X:X:XHXHXGXGXTXTXXXXXYXYXZXZY#Y#Y$Y$Y%Y%Y&Y&Y'Y'XUXUVIZ6XWXKXJXJXIXIXSXSXRXRXQXQXPXPVLVL)<)=T<T<XLXLXHXHXGXGXTXTVMVMVMVM)>VJVJVG)?VOVFVFVFVHVHVHVHVH)@VKXWXKXJXJXIXIXSXSXRXRXQXQXPXPVLVLT<T<T<T<)AVL)BY()CVNVNVN)DVMVMVM)EVJVJ)F)GVO)H)I)J)K)L)M)N)O)PVKVKVKVKVKVKXIXSXSXRXRXQXQXPXPVLVLT<T<T<T<)QVL)RY()SVNVNVN)TVMVMVM)UVJVJ)V)WVOVOVO)XXEXEXEXEXE)YVKVKVKVKVKVKVKVKVKVKVKVKVKVKVK)Z*#*$*%*&*'*(*)***+*,*-*.*/*0*1*2*3*4*5*6*7*8*9*:*;*<*=*>*?*@*A*BVKVKXPXPV,*BXNXNU;UZ*ATI*BTITIV,TIV,V,*AV,*BU;*BV>V>*BUZ*CUZUZUZTV*CY#W@YIY#XJT-UVT-XSXS*A*BU$U$*B*C*CTI*DTITI*DTITI*DV,TITIV,*D*E*FUZ*FUZ*GUZUZV4XHVPVPYJ*FYJYJ*F*GXXXX*GYIYIX1YI*G*GW@X1*HW@*H*I*JX/*JX/*K*K*LX.*M*M*NWZWZ*NWZWZWZXVXVWZ*NVTVTVTUV*MUVUVUVUVT-UVT-*LVC*MVC*MU:VC*NU:U:*NU:U$*NU$U$*N*OU$U$TIV,U$V,V,*NV,*O*OU;*P*QU;U;*QU;U;U;U;*QX9XHXHX7XGXGX7YBYJ*OYJ*PYWYWYW*P*PY9Y9*Q*QYIYIYIYIYI*QYIYIYI*Q*R*R*SX1X1X1X1*S*T*TW@*UW@*UX/*V*WX/X/*WX/X/*WX/*X*X*YW>*Z*ZWZ+#WE+#+$WEWE+$+%WE+&VTVTW;+&VTVT+&VTXKUVXKT,UVUVT,UV+$T-UVT-VE+$XSV5+$VB+%VB+%+&VB+'+'V.+(+)V.VD+)VDVD+)VDVDV,+)V@+*U;+*U;V@V@+*V@V@+*U*++U*XNXNU*V7YBYBXH+*YBYB+*YBXGYJYB+*+*+++,+-YW+-+.+/+/+0+1+2YIYI+2YI+2+3+4+5+5X1+6X1X1X1+6+7X1+7+8+9+9+:+;+<+<+=+>+?W@W@W@+?+?+@W6W6W6+@+AW)X/X/+A+BX/+BX/X.X.X.X.+BX.WEWUXUWE+AXUW;W;W;W;T,VB+@+A+B+B+C+D+E+E+FTYTYV.VD+F+GVDVDTO+GV@V@+G+H+HV@V@V@V@V@V@+HV@+H+I+J+JV7+KV7+K+LYKYK+L+MYK+N+N+O+P+Q+Q+R+S+T+T+U+V+W+W+X+Y+Z+Z,#,$,%,%,&,',(,(,),*VV,*,+,,,-VR,-VRVR,-,.,/X+,/,0,1X*X*,1X*X*,1,2X*X*,2,3X*,4,4,5WXWX,5,6,7,8X.,8X.,9WUXUWUWEWZ,8,9WZ,9,:UC,;,;TYTYTYTY,;TYTO,;,<,=,>,>,?UUUU,?UUUUUU,?U0XNXNXH,?XHY@,?,@,AYD,A,BYDYD,B,CYOYO,C,DYO,E,E,F,G,H,H,IY;Y;,I,JY;,K,K,L,M,N,N,OVW,P,P,Q,R,S,S,T,U,V,V,W,XX+X+,XWXWX,X,YWXWX,Y,ZWXWXWX,ZWX-#-#X.-$Y'X.X(X(X(-#WEXUXUUC-#-$-%-%TY-&-'-'TO-(TOTO-(TO-)XH-)XHS=-)-*S=-+-+-,---.YOY,T)T)Y,---.S<-.-/S<-0-0-1-2-3-3X&-4X&X&-4X&X&-4-5-6-7-7-8-9-:-:-;-<-=WXWWWXWW-<X(X(X(ZJZCXKZCV?-;XRUK-;-<UK-=-=->-?-@TOTO-@UMTO-@UM-A-AUT-BUTXHX5XHSD-A-B-CT%S3S3-C-D-DT)-E-F-FS<-GS<S<-GS<-H-H-IWT-JX&-J-K-L-LW<-MW<-M-N-OW?W?-OW?W?-O-PW?-Q-Q-R-S-T-TWX-U-VWXWX-VWXWXWX-V-WWXX(-WX(UK-WUKXQ-W-XUNUNUNUMUN-X-XU1-YV=-Y-Z.#.$.$V2.%.&VAT..&.'XH.'X6.(.(T%.)T%.)S5.*S5.*.+S5T$.+T$T$T$T#.+T#T#.+SK.,SK.,SKSK.-.-WT.../WTWT./VQ./WH.0WHW?.0W?Y$.0X0X0X0.0.1.2.3.3WX.4.5.5X#WX.6.6Y&WGY&XP.6XPXP.6UFXPTRTGTGV$.6TG.6.7TLTL.7TL.8TBXNU/XNXH.7XHS8.7.8.9.:.:.;.<.=.=.>.?SN.?.@SN.A.AT#.B.CSKSK.C.DSK.D.ES2.E.FS2.G.G.HSXSXW?W?W?.HW?.HW?.I.I.J.K.L.LW3W3W3.L.M.NWGZBXUZ9Z9XUXUZ9ZRZHZH.LZHTRV$Z?XP.KTG.LTGTG.LTG.MTL.M.N.O.O.P.Q.R.RXMTCTCSE.RXHXHS0.RXGXG.RSNXGT(.RSC.S.T.T.U.VSM.V.W.X.YSI.Y.Z/#S2/#SZSX/#SXSXXYW?W7Y$W7.Z/#W7/$W7W7W7/$/$/%/&WFWG/&WF/'ZPZP/'/(Z9ZRXUZRZRZFXVXVZHZHXVZWZ?UBXPUB/$/%/&UB/&/'/(/)/)V0/*V0TC/*TC/+U(U(U(/+U(UWU(UWSO/*SO/+/+/,/-/././/SR/0/0/1SASA/1/2/3XYY#Z1Z+Z+W7WOW7/2/2WF/3WFWFW8WF/3W8/3W8/4ZSZ7ZS/4ZKZWXVXVZWZWZ>Z>Z>Z<ZZ/2/2ZT/3/4ZEXIZVZVZIZIZVZV/2/3UB/4/4/5UA/6/6/7TTTT/7/8/9/:/:/;T@/</<XLT@XLSQ/<SQSQSR/</=/>/>SA/?/@SAZ.SU/@Z0Z0/@Z*/@W7Y%Y%/@WFY&Y&WF/@XEXE/@/A/BX@/B/CX@X>/CZSX>XUZS/CZSZSZAXV/CZAXWZ>XWZ=Z=ZX/BZXZVZV/BZVZVZVZV/BUB/BUB/CUAUA/C/D/D/E/F/G/GV3/HV3V3/HV3V3XT/HXTT+/HSQT+/I/I/JSF/K/K/L/MSUSUZ*XYZ*XZZ2Z4Z2/KX@/LX@X@X>/LX>Z;Z;ZN/LZXZXZ6XKZ@ZQXSXSXOV1V1/J/J/K/LT3/L/M/N/OT+/O/P/Q/Q/RSH/S/SSU/TXX/TX@/UX=X@X>X=/UX>X>/U/VX>X>/V/WZNZNZMXVV1/VV1/W/W/X/Y/Z/Z0#0$0%SH0%SHSHXE0%XEXE0%X=Y'X=X=0%X=0&XFXF0&0'0'0(0)T2T80)0*T8Y'0*Y'Y'0*0+XBXBXOV1XOV+0*0+0,0-0-XNT7X<V+0-XOV+T<0-XNXNV+V+T<T<0,T<T<T<XZXZ0,VJY$Y$VGVOXVXV0+VKXLXL0+VLXH0+VL0,0,SH0-SH0-VM0.VM0.VJ0/VJ0/VG00VGVGVOVGVO0/00VOVO0001VOVO010203XE0304XEXE0405XEXE0506XEXE0607XEXE0708XEXE08VK09VK09VL0:VLVL0:VL0;0;SH0<SH0<VM0=VM0=VJ0>VJ0>VG0?VGVGVOVGVO0>XE0?XE0?VK0@VK0@VLVKVKVLVLVKVKT<T<VKVKT<T<VKVKT<T<VKVKT<T<VKVK0;VLVKVKVLVLVKVKVL0:VKVKY(Y(VKVK09SHVKVKVNVNVKVKVNVNVKVKVNVNVKVK06VMVKVKVMVMVKVKVMVMVKVKVMVMVKVK03VJVKVKVJVJVKVKVJVJVKVK01VGVKVKVGVOVKVKVOVOVKVKVOVOVKVKVOVOVKVK0-XEVKVKXEXEVKVKXEXEVKVKXEXEVKVKXEXEVKVKXEXEVKVK0(VKVKVKXPXPV,U;XQXQU$TIU$TIU$TIV,U;V,U;V,U;V,U;U;U;U;UZU;U;UZUZV>UZV>V>TVTVUZUZT-TWT-TWTWU:VCU:U$U$TITIU$U$TITIU$TIU$TIU$TITITIV,V,TITIV,V,TITIV,U;V,U;V,V,TIV,V,U;V,U;UZUZUZV4UZV4UZUZYJYJYWYWYJYJ/IY9YJYJY9YI/HYIYIYIYIX1/HX1X1W@X1X1X1W@X1X1W@X/W@X/W@W@W@X/W@X/X/X/Y'X/X.X.X/X.X/X.X/X/X.X.X/X/X.X.X.X.X.WZX/X/X.WZX/X/WZWZX/XUWZWZWZVTVTVTVTVTVTUVT-TWT-TWT-TWT-TWVCU:VCVCVCU:VCVCU:U:VCU:TITIU$U$TITIU$U$TITIU$TIV,U;T?T?T?T?V,U;U;U;T?U;T?U;U;U;U;U;U;V@U;U;V@V@U;XNU*XNYJYJ/*YWYWYW/*YWYW/*/+/,YWY9/,Y9Y9Y9/,/-YIYI/-YIYIYIYI/-YIYIYIX1YIYIX1X1YIYIX1X1/*X1X1X1X1X1X1/*X1X1/*X1W@W@X1W@X1W@X1W@W@X/W@X/W@W6W6W6X/X/W6X/X/X/X//%X.X.X/W>X//$X/W>X.X.W>W>WZWZW>X,W>X,X.X.WZWZX,WZX,WEX.X.WZWZWZWEWZWZWEWEWZVTWEWEVTVTWEW;WEW;W;W;W;VTW;W;VTVTW;VTUVT-XJXJVBU=U=V5.NVBV5VBV5V5VBVBU'U'VBVBU'U'TXTXVBTXVBVBU$V.U$V.U$V.U$.IV.V.V<V.V..HV..IV,V,VDV,V,U;V,U;V@U;V@V@V@V@U;V@V@U;V@V@U;V@V@V@V@V@U*U*Y6.BY6Y6.BYB.C.DXGXGY).DYJ.D.E.F.FYW.GYW.G.HY.Y..H.IY..J.J.K.L.M.M.NZ'Z'.N.OZ'Z'.OYX.P.Q.Q.R.SYI.S.T.U.V.V.WYGYG.WYI.X.YYIY>YI.Y.Y.Z/#/$/$/%/&/'YI/'/(/)/)X1/*/+/+X1/,X1X1X1/,WRX1X1WRVRX1X1WLWL/*/+VRVRWLWLVRVR/*X)/+/,X)X)/,X)/,WKVR/-WKWKW%/-X)X)X)/-X)W@X)W@/,/-/.//WJ///0/1W@/1W@W@W@W@/1W6W@W@W6W6W6X/W)W)W6W6W6W)W)X/W)/.X/X//.X/X/X.X.X.X.WUX.WUWEWEW;W;VBVB/+VBVBUCXRUC/*UCUCUCVB/*/+/,U$U$/,/-UCUCUC/-TYTYUCTYU$V<U$V<V<V.V<V.TY/*TYTYTOTO/*TO/*TOTO/+/+TZ/,/-V@V@/-/.V@U;V@V@V@/-/.//TETEV@TE/.UPUP//U0U0U0U)TE/.V7V7V7V7U)UO/-YBYB/.YBYB/./////0YK/1/1/2/3/4YK/4YK/5Y.Y./5Y.Y./5/6/7/7/8/9/:/:/;/</=/=Z'/>/?Z'Z'/?/@/@/A/B/C/C/D/E/F/F/G/HY?/H/IY?Y?/I/JY1Y1/J/KY1/L/L/MY?Y?/MYI/N/OY?Y?Y?/OY?Y?/O/PYIYI/P/Q/Q/R/SZ&/S/TYIYI/T/UYIYI/UYSZ&/V/V/WWMWM/W/XYI/YVXVXVX/Y/YX1WMVV/Y/ZVVVVVXVV/Z0#X1WRVVWRWRVRWRWRVVVVWSWSVRVRWSWSW%/WVRVRW%W%VRVRW%W@W%W%VRVR/UX+W@W@W5W5W@W@W5X*W5W5X+W5W6W6X*X*W6W6/QX*/QW)W)W)W)W)X*X*W)W)/P/QX*WXWXWX/PWXWXWXWXWXWX/PX/X//PX//PX.X.X.WX/PWXWX/PWX/Q/RX.WUX.WUX.WUX./QWZW;WZWZWEWZWEWEUC/OUCUCTHTH/O/PUC/PUCTY/PTY/QTY/QTOTOTOTO/QTO/RTZTZ/R/STO/STO/T/TUU/UUUV@/U/V/W/W/XUUUU/XUUUUUU/XU0XNXNYDYDYD/XYDYD/XYDYD/XYD/Y/YYD/ZYDYKYK/Z0#YK0#YKYK0#YO0$0%0%0&YOYO0&0'0(0)0)0*0+0,0,0-Y,Y,0-0.0/0000010203Y,03Y,04Y;Y;04Y;XXYTY;Y;YT03Y;Y;YI03Y;04YIYI0405Y;05Y;06YIYI0607VUVUW#VU06070809W#W#09XYVUVUVWVUWVWVWV08VWVW0809WVWS09WVWSWSWVVRVW08VW09WV090:0;0;VR0<0=VRVR0=0>0>0?0@0A0A0BW/W/VRVR0B0CVRX+X+X+0BX+X+X+X+X*WXWXX*X*WXWXX*X*WXX*X*X*X*0?X*WX0?WXWXWXWX0?0?0@WP0AWX0A0B0CWPWP0CWWX(0CX(X(0C0D0E0FUC0FXRV?0FV&0GU20GTY0H0IV&0I0J0KTYTYTQ0KTY0KTYTOTY0KTOTO0KUU0LUU0LUU0MUUXHY@XHS=0L0MS=S=YD0M0N0OS=0OS3S30OT*0PT*YO0PT*YE0PT*S3T)0PT)T)T)0P0QY,XXT)T)T)S<Y;Y;XX0P0P0Q0R0S0S0T0UVS0U0VW+0W0W0XVYVYVSVYWT0XVYVYWTVY0WX&0XX&0X0YVY0ZX&0ZX&X&0ZVW1#1$1$1%W:W:W:W:1%W:W:W:W:1%1%1&W:1'1'1(1)1*1*1+W<W<W<1+W<1,X+X+W<W?X+WXWXWX1*W?W?W?WXWXW?WXWWWW1)1*V?1*UKUKU2U21*U2TP1*TP1+UKUQUK1+1+UJ1,1-1-TO1.1/UQUQ1/UN1/1011UQ11XPUQXP11UUXPUUXPUUU1U1UUUUUU10UU1011UTX5S=1112S=S=SD12SDSDSDT%T%S3T%S5S3S3S5S3S3T)S3T)S3T)S3S3T)T)T$T)T)1,T)S<T)S<T)S<1+1,1-WTS<1-S<S<1-1.WTWT1.X&1/X&1/10WTWTX&X&10X&1011W.1212X&WHWH12W<X&13X&W<WHXZW<W<W<121213W?W?W<13W?W?13W=W?1414WX1516WXWX16171718W?19WXWX19W?W?WX19X0191:1;W?1;X0X0X0WXWXX0WX1:WX1;WXWXWXWX1;WXWX1;WXWXWX1;1<WX1<WX1=1=1>X#X(UK1>XQUN1>UNUNUNUN1>UNUNUN1>UNU-UM1>1?TK1?TDU-1@U1U1TNTNU1UTU1U1XOXOV=TGU<1=U<XOUTU+U1V'V'1<XOXOV21<XOXOV*1<XNTL1<T/US1=1=SDT%T%XHT%S@1=SDT%T%T%T%T%S@T%T%S5T%S5T%S5T%S5S3S3S5S5S3S3S318S3T$T$T$T#T)T#T#T)SKT#SKT#SKT#SK14SKSKSKSKSKSK1414WTSKWT14WTS4S4WT1415VQWTWTVQVQWTWTWTWHWHWHVQWHW?12W?Y$W,12Y$X0X0121314X-W$X-X-13W$14W$1415W$16W$16W$1717W3X-18WXWXW3WX17WXY&Y&Y&WGWXWG16WGWGWG16U-XPXP1617U&UFV$TGV$TGXOXO1617TG17TG18XN18TLV;TL18TLTL1819S@1:S@1:S8S?S5S5S51:S?S?1:SES?1:1;S?S5S5S51;1;T&T&T&1;1<S0S0T&1<1=S11=T$T&T$1=T$1>SN1>T'1?1@T$T$SN1@T$T#SN1@SN1@1ASCT#T#1AT#1AT#T#1BT#T#S6S6SKSKS6SISK1@SISISK1@SKS2SKSISISI1?1@S2S21@VQ1A1BS2SXS2S2VQVQVQSXVQVQSXSX1?W*1@W*W?X0W?X0Y$X0W?W$X0W$X01>1>1?1@WN1@W$W$W$WNWNW$W3WN1?WN1@Y&Y&W3WGWXWGY&WGWXWGW3WBZHZGZHZHV$V$TGXOXOTGU.U.TG1:TGTGTGTGTGUGTLU/TLTFTLTLUGUGTFTFUGTFU/16U/V%V%TMV%TMU/U/TFV0V%TMV0TCXMXM13XMSY13SYSY13S114S11415S1XGSN1516SCSTSCSO16SCSCSOS:S6S6S615S6S6SMS6SCS:S:14S6S614SRSISISR1414SRSRSRSRSRSR14S2S2SIS213SJ14SJSJSZ14SZS2S2S2SXS2SXSXSXW$12W7WA12WAWAWA12WA1314W7WB14WOW(WB1415WBWG15WBWBWFWOWFWG14WFWFWFWFWFW8W8ZPW8W8ZPY'W8W8U.U.1112U.U.12UBUB12UBUBTGTGUBUBTGUGTGUGUBUBUBU%U%UGU%UGUGV0UGUGUGV0UGV0TCU(TCU(1+U(1,U(U(U(1,U(SO1,S:S:1,1-1.1/S:1/S:SMSMSMSMSR1.SMSQSM1.SRSMSRSMSRSRSRSR1-SR1.SR1.SRSR1.SJ1/SA1/SZSA10SZSZ10SZSXSXSZXY1/10SASAW7WOW7W7WOWOWO1/WOWFW7W7WFW8WFW8W8ZSW8ZSW8ZSW8ZSZ7Z7Z7ZAZZXKZZZ5Z<XJZOXJZOXJZ5ZOXJZTZOXJ1&V/UBUBV/U%V/1&UBUAUBUAUG1%UAV)V)UGV)TTV)1$UAUAUGV0TTTTV0V0TTTTTCTCTTT0T0U(T0U(TTT0TTV3T00W0XT@U(U(T@T@0W0X0Y0ZT@0ZT@T@0Z1#UEUESQSQSQ1#SRSRSRSSSQSSSSSS0Y0ZSSSS0Z1#SSSSSS1#SS1$1$SU1%SUZ.Z.XYZ3Z3Z*Z3Z*W7W7Z,Y%W70ZY&Y&WFW-WFW-W8W8Y'X@W8Y'X@X@Y'X@XEX@Y'W8X@X@W8ZSY'X>ZSZSX>X>ZAZAZSZSZAZAZ;Z;Z=Z=Z=ZXZTXIXIZVZVZVZVZ@UBUA0NUAV10NV10OUAUAUA0OUAT>0OT>TTTTUATJTTTTTJTJT>0MT>TJTJTJ0MTJ0MV3V3V30MV30NV30NT@0OT@SQSQT+T+SQSQ0NT+T+SFT+SFSSSSSF0MSS0M0NSGSGSG0N0OSGSUSGSG0NSUSUSUSG0N0OSUXEX@XEX@XEX@XEX@X@0MX@X@Z;XVZNZNV1T20L0MT40MT80N0NT>T3T30N0O0P0QT>T>0Q0R0R0S0TV3T3T>T30T0T0U0VV3T+SFT+SFT+T+T+SHT+SHSHSHSFSFSF0S0SSHSHSHSHSH0S0TSHSU0TSU0TSHSHSHXEX@XEX@XEX=XEX=X=X>X=XFX>X>XFXFX>X>XF0PX>X>0P0QX>XUXFXU0PT90Q0R0RT60S0TT5T3T:0TT3T3T30TT:0TT8T80T0U0VT1T30V0W0X0XV3UR0Y0Y0ZT1T1URURT1XN0YSHSHSHXEXEXEXA0XX=XAY'X=XFX=0XX=0XX=0YXFXFXD0YXFXF0YXFV1V1V10Y0YT8T8T8V10YV1V1T1T10YT1T20YT2T2X=0YY'Y'XDXDXBXB0XXDXBXBV10XV1T70X0YT7T7V+T7V+V+T7T70XT70XT2T7T7V+T<V+V+XNX<T<XNT<T<V+T<VMVJVMVJVHVKVHVKXLXLT<VLXHXHVLY(VLY(VLY(Y(SHY(SHY(SHY(SHVNVMVNVMVNVMVNVMVMVJVMVJVMVJVMVJVJVGVJVGVJVGVJVGVFVFVOVOVFVFVOVOVFVFVOVOVFVFVOVOVFVFVOXEVFVFXEXEVOXEVOXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVKXEVKXEVKXEVKT<VLT<VLT<VLT<VLVLY(VLY(VLY(VLY(Y(SHY(SHY(SHY(SHVNVMVNVMVNVMVNVMVMVJVMVJVMVJVMVJVJVGVJVGVJVGVJVGVOXEVOXEVOXEVOXEXEVKXEVKXEVKXEVKXOVLVKVLT<VLT<VLVLY(VLY(Y(SHY(SHVNVMVNVMVMVJVMVJVJVGVJVGVOXEVOXEXEVKXEVKYJYJ/T/UYJYJ/UYIYIX1YIYIYJYJYJ/TYJ/TYJYW/TY9Y9Y9XTY9/TYFY9Y9/TY9YW/TY9Y9Y9Y9/T/UY9/UYIYIYIYI/UYIYIYI/UY>YIX1X1X1X1X1/T/UX1X1X)X)X/X//TW6X/W>X/X/VBVBU=VBU$V<U$V<V.VDV.VDV./PV.V.Y6Y6Y6/PYBYB/PYB/P/QY6Y6Y:/QYBYBY)Y.Y)/QYJYJYJ/QYJY5Y5Y5Y5/PY5Y5/PYWYWYWYWYWY5YWY5Y5/O/PY5Y5/P/QY5/QY5Y5YW/Q/R/SY./SY./TYWYFYWYWYFY9YXYXYWYWYWYNYN/QYN/R/RYWY5Z'YWXTZ'Z'XTY=/QY=/QZ%Y=/RY9/RYXYXYNYNYN/RYN/RYNYN/R/SYXYI/SYIYIYI/SYIYN/TZ%Z%/TZ%Z%Z%Z%/T/T/UZ'/V/V/WYGYG/WYGYGYG/WYGYGYGYIYIYGYIYG/VYGYGYIYI/VYI/VY>/WYI/WY>Y>Y>Y>Y>Y>/WY>Y>YIY>Y>YP/VYPYIYIYI/VYIYIYI/VYI/VYIYIYZYZYZ/V/V/W/X/Y/Y/ZYPYPYP/ZYP0#Y>X10#X1YP0#0$0%X1X10%X10%0&0'0(0(X1X1X1X10(X1WRX1X1VRVRX1WLVR0'0'0(0)X)WLX)WLWKX)X)WKWKX)X)WKX)WKWKWLWKWK0%VR0&0&WKW%W%X)X)X)0&WK0&WKWK0&WJ0'WJWK0'W%W%W%0'W%W%0'0(W@W@0(WJW%WJWJW@WJW@W@0'W@W60'W6W6W6X/X/WXWXX/X/WXWXVBVB0%0&0&UCUCUCU$U$VBU$VBVB0%0&VBVB0&TSU$U$0&U$U$U$U$0&UCUCUC0&TOTO0&UX0&TOTYTO0&TOTOTOTO0&TOTOV@V@TZTZ0%TZTOTO0%TZ0&0'TZ0'TZTZ0'V@TZ0(V@V@UU0(V@UUV@UUUU0'UU0(V@V@UPUPUPU0UPU0U*V70&V7Y6Y6XGYBYBYBYKYKYB0$YK0%YBYBYKYKYBYBYB0$YBY)0$0%YK0%YKYKY)Y)0%0&0&0'0(Y.0(0)YKYK0)Y.0*0+YKYKYK0+0+0,YK0-Y.Y.0-Y.Y.0-0.0/Y.0/Y.0000YM01YM01Y.0203Y.Y.03040405YO060607YOYOY.070809090:Z$Z$YO0:YOYO0:0;0<0=Z'Z'0=Z'YM0=0>0?0?0@0A0BZ'Z'0B0CZ'Z'0C0DZ$0DZ$0E0EY/0F0G0G0H0I0J0JY20K0L0L0MY2Y20M0NY20O0O0P0QY-0QY10RY10R0SZ'0T0T0UY?Y?0U0VY?Y?0VYGY?Y?YGYGY?Y?0U0VY1Y1Y?0VY1Y10V0WY10X0XY?Y40Y0Y0Z1#1$1$1%1&Y?1&Y?Y?Y?YIYIY?1&Y?1&Y?Y?1&1'Y?Y?Y?1'YTYT1'Y?YTYTY?Y?YTYI1&1'Y?Y?YIYI1'YIYI1'1(1)1)1*1+1,Z&Z&YIZ&Y?Y?1+1,1,YIYIYIYI1,YI1-Z&1-1.YI1.YS1/1010YSWMWMYS10YSWM10X1WMWM1011YIYIWMWMY+11Y+Y+YIY+VXVXVUVUX1X11/WMX1X1X11/X1X11/X1VX1/10VU10VUVUVUW%W%10W%X+X+10X+X*10X*X*W6W610W)10W)WX1111WXWXWXW)WXWXWXWX10WXWX10X/WXWXX/X.X.X.WXX.WXWXX.X.WXWXWXWX1-WX1-X.1.X.WUWUX(1.UCTHTHTHTHTHUCUCTHTHTYTY1+TYTYTYTHTYTHTHTHTH1*TY1*TOTOTOTO1*TOTZTOTZTO1*TZTZ1*TZTZ1*1+1,1,1-1.U31.1/1011U311U312U31213UUV@V@V@1313V@14UU1415UUUUV@V@1516V@16UUUU16UUUUUU16U0U0U0YDYD1617YDYD1718YKYK18YK1819YDYD19YD1:YD1:YDYDYD1:1;YDYD1;1<YDYDYK1<YK1=1=YO1>YOYKYKYK1>1>YO1?YOYOYOYO1?Z(Z(YOZ(1>1?Z(Z(YRYR1?YRZ(Z(YOYO1>1?YOYL1?Y-YRY-Y-1?Y-1@1@1A1B1CY-1C1DYUYYYYY,Y,1C1DY,Y,1DY11E1FY1Y11F1GYVYV1G1HYVYV1HYV1H1I1J1KY1Y11KXXYVYV1KY;YVXXY;Y;Y,1JY,Y;Y,Y,Y,1J1JY;1KY;YTYIXXXXYIYI1JYIX%X%Y;Y;X%X%X%1IX%1IX%X%1IX21J1KY;1KY;1L1LYI1MX%YIYI1M1N1NW#1O1PW#W#W#1P1P1QX&X&1Q1RX&X&1RW#X&X&1R1SVWVWVWVWX&1SVWVW1S1TWVWV1TWVWVWV1T1UVW1UVWVWWVX$WV1U1U1VVWVWWVWVVWWV1UVR1VVRVRVRVR1VVRVR1V1W1W1X1YW'1Y1ZW'W'X$1Z2#2$2$2%2&2'2'W/2(W/W/W/2(W:2(2)2*W'W'W'W'X+2)W'W'W'W'2)W'W'W'W'X+X+X*X*WXWXX*WXWXWXWXWXWX2&WX2&2'WP2'WPWPWPWPWP2'2(WX2(WXWXWXWX2(WP2(2)WPWP2)WW2*WWX(WEX(WEUCUCUC2)2)TYV&V&UC2)UCUCV&V&2)V&UCUC2)2*UCUC2*2+V?2+V?V?TY2+V&TYV&2+V&V&V&2+V&2,V&2,V&V&U22,U2U22,2-U2U22-TYTPTQTYTOTOTOTOTO2,TO2,2-TO2.2.2/TOUUTO2/TO20TO20TO2121YDYD22YDYD22YDYDYDS3S32122S=S=22S323S3S3S3S=S3S3T*22T*22T*23T*YOYOYEYET*T*S3T*21T)T)T)Y,21Y,22Y;Y;2223WI23WIWIY;Y;23Y;Y;23242525W+WIW&W+W+25W+XX25W92626W+27282829S<W929Y;W+W+292:W+W+W+2:W+2;2;2<2=VY2=VYVYVYWT2=WTWT2=X&2>2?VY2?2@X&VY2@VYVYX&X&2@X&2@X&VY2AX&2AX&X&2A2BX&2CX&W:2CW:2CW:W:W:VW2CW:W:W:2CW:W:X&2CX&X&W:W:W:W<W:2BW:W:2BW:W:W:W:W:2B2CW/W/2CW<W:W<W<W<2BW<W<W<W<W<W<W?W:W:W:2A2AW<2BW<2B2CW<2DW<2D2E2FW?W?2FW?WW2FWWX(2FX(X(X(V?U2V?2FUKU2UKUKTPV#TPTPTPTPTP2DUKUQUKUK2CTOTPUJTP2C2D2EUJUQUQUQTOTO2DTOUQ2DUQUQTOTO2DTOUQUNUQUNUQUQ2CUQUQ2CUQUQ2CUQUNUQ2CXPUJXP2CUUXPXPUUUTUUUTUUUTUUUTUUU1U1U1X5SDSDSDS=S=SDSDSDS3SDT%2=S<T)S<S<2=2>2?VSWTWTWTS<WTS<S<WTWTS<WTVYVYWTWTWC2;WT2<X&X&WTX&WTWTWT2;WT2;WTWT2;WQ2<2=X&X&2=X&WQX&W.W.X&2<W.2=W.2=W.WH2=X&2>XZX&2>X&2?X&W<X&W<2>W?W?W?W<2>W<2?2?W?W?W?W<W?W<W<W?2>W?2?W?2?W?W?W=WXW=W=W=W=W?W?W=W=2=W=2=W=W=2>W?X'2>2?W?W?W?2?2?2@2AW,2AW,W?W,X'X'2AW?W?W?W?2AW?W?W,2AW?W?2AW?W,2AW,2BW?X0W?X0X0WX2AWX2AWXX0X0WXWXWX2AWXWXW$WXWXWXWX2@WXWX2@WXWXWX2@WXWXX#Y&X#WXX#2?X#X#Y&2?X(UKUKUK2?UKUN2?UNUN2?UNUNUMUMUNU-UMTK2>TKUM2>UMTKUM2>U-TDTDV=V=V=U<V'U<U<V'V2XOV2V2V*XOXO2:VAV:V:2:V6U@2;U,U,U#UIXHSDXH2:2:S@S@S@S3T$T$T$S<29SKSKSKS4SKS4XYWTSKWTSKSKS4S4WTWTVQ26WT26VQVQW?W,W?W,W,X025X0WXWXX0X-X0X0W$W$23X-W$W$W$W$X0W$X022X0W$X-22W$W$W$X-W$22W$22W$W$WXWXW$WXW$W$Y%WX20W$X-W$20W3X-W3WX20WXWXX#X#Y&WGUN2/XPU-U-V=U&U&V=V=2.2/TL2/TLTLTUU@2/TLTGTLTLTLTLTL2.TLUIUIV;V9V(V(2-TLXHS@XHS7S@S@2,2-2-S@S8S8S@S5S@S5S5S5S?S5XH2+XHSES?S5S?S0SES?2*SYS5T&S5T&S5S5S5T&S5S5S0S0T&T&2'T&S12'S1S1S0S1S02'T$T$2'T$T$T$T$2'2'SNSNSN2'T'SPT'S12'S1SPT'SNT'SN2&SNSNSNSNSCSN2&2&SC2'T#SN2'SNSCT#T#2'T#2'T#2(T#T#T#T#S6SKSKSKSISKS4SKS2S22%S2S22%S4S2S2S4VQS4S4S22$S2SBVQVQ2$XYW?W?2$W*W?W*W*W*W$W$2#Y%W$W$W$WN1ZW$WNWNW$1ZW$W$X01ZX0W$X-W3WNW3WNW3W3W3TLTLTG1XU/XNU/V%TMTMTMTCSY1VSYSY1VS1S0S11VS1XGS11V1W1X1Y1YSN1ZSNSNSNSCSCSNSC1Y1ZSTSTSOSOS6S6S61YS:SMS:SM1XS6SRSRSISI1XSRSRSRSMSRSRSRSR1WSRSJSR1W1WSJSJSJSJ1W1XSZW$W$WA1XW$W$W$WAWAWA1WWAW71WW7W71WW7W7W7WO1WWOWOY&W(WB1W1WWBWBWBWBWBWF1WWGWGWGWFXOU.UBU.U.U.1UU.U.U.1UUBUBU.UBUBTCU(TC1TT0U(T0U(U(U(U(1SSOS:SOS:S:1R1S1TS:S:SM1TSQ1TXTSQ1TSQSQSQS:SMSMSM1SSMSMSMSMSMSMSRSR1RSR1S1S1TSR1USRS;SR1USJSJ1USA1USAS;SA1USZ1V1WSASZSASASZSZ1VSZSASZSASASZXY1UXYWOWF1UWFUBV/UBUBV/V/V/UAUGUGUG1SV)V)V)1ST0T@T0T@1RV3V3V3U(V-1RT@V-V-T@1R1RT@T@T@T@1RT@UET@1RT@T@1R1S1T1UV-V-1UXLSQSQSQ1USR1USS1VSSSS1VSRSRSASSSSSASA1USASSSSSS1U1U1VSU1WS9SUS9SUS9SU1VS9WFWF1VWFUBUB1V1W1WUA1XUAV1UAV1UAUAUA1WUAUAUA1WT>1WTJTJTJTJTJ1WTJ1WV3V3V3TJV3TJ1W1WV3V3V3T@T@V31WV3T@V3V31VSQT+T+SSSSSF1VSSSSSSSGSSSGSGSGSF1TSFSFSGSGSF1TSUS9SU1T1TSUSGSUSGSG1TSGX@X>X@X>V1V1V1T9T5T5T9T5T4T8T4T81PT8T8T8T81PT8T8T2T2T21PT;T31PT3T51PT5T51PT3T2T3T3T3T31P1PT>1QT>1QTJT>TJTJV3V3V3T>T>T>1PT3T3T31PT>T31P1QT3V3V3V31PV3V3V3SF1PSH1QSF1QSFSHSH1QSH1R1RSHSVSHSHSHSH1RSHSWSHSHX>X>XFXFX>X>XFXF1O1PXFXFV1T9V1T9V1T9V1T61NT6T6T6V1T6V1T6V1T6T81MT6T61MT81MT31NT3T3T3T31NT:T3T:1NT31N1OT11OT1T1T11OT1T1T11O1P1QURT31Q1R1S1SURURUR1SV3UR1T1T1UURV3T11UT1T11UURT11VSH1VSHSHXEXEXA1V1VXFXFXFXD1VXDXDXDXD1VXD1V1WXDXD1WXDXDXDV11WV11X1XT8T8T8V1T8V1T2T1T11WT1T8T8T2T21VXDXDXDXDXDXDXBV11UV1T7T2T2T71UT2T21U1VT7T7V+T7T2T2T7T7YW1TYWYW1TY91UY9YJYJ1U1VYJYJYJYWYWYWYJ1UYWY9Y9Y9YWYFYWYFYFY9YFY9YWY9Y9Y9Y9Y9Y91QY9Y9YIYIY9Y9YIYIYIYIY9YI1NY>Y>Y>1N1OX)X)X)1OX)X)X/X/X/W6VDVDV.VDY6Y6Y61M1MYBYB1N1N1OY6Y6YBYBY6Y6Y:Y:YBYB1M1N1O1PYJ1PYWYWY5YWY5Y5YJYW1OYWY.1OY.Y.1OY5Y.1PY5Y51PY.Y5Y5Y51P1PYWY51QYWYWYWY5YWYWY.Y.Y5Y5Z'Y5Z'Z'1NZ'1NZ'1O1PYXYXYNYNYNYNYN1OYWYWY5YWZ'Y=Z'Z'Z%1MZ%Z%Y=Z%Y=Y=Y9Y9YXYXYNYN1KYNYN1KYNYNYXYIYXYXYIYIYX1JYIYI1JYIYXYXYNYNYNYIYNYNZ%Z%Y=Z%Z%Z%Z%YGZ'1FZ'Z'Z%Z%1FYG1FYGZ'YGZ%1FYGYG1FYGYGYGYNYNZ%YGYGYIYGYGYGYIYG1DYGYIYIYI1CY>Y>Y>Y>Y>YIYIYIYIY>1BY>Y>Y>1BY>Y>Y>1BYIYIYI1BYIYIYZ1BYIYZ1BYZ1B1CYSYP1C1DYIYIYP1DYIYIYIYIYI1DYIYIYI1DYZYZ1DYPYZYP1DYPYPYPYP1DYPX1X1X1Y>Y>1CYPYPX1YPYPYPYP1B1CYP1CYP1DX1X11DX11DYIYIYIYP1DYI1EYIYIYI1EX1X11EX1X11EX1X1X11EX1WRVR1EVRVRX1X1X11EX1X1X)X)X11DX)X)WKWK1DWKW%W%VR1DW%WKW%W%X)X)X)WJX)WKWKWKWJWJ1AWJWKWJWKWJWKW%W%W%W%1?W%W%WJWJWJW@W@W@1>W@WJWJ1>WJW@1>W@W6W@W@1>W6VBVBVB1>VBVB1>1?VB1?UCUCVBVBUCUCVBVBUC1>VBVB1>UCU$U$TSTYU$U$TYTYUCTHUC1<TY1<TYTY1<1=TOTO1=TOTOTOTO1=TOTO1=TZ1>1?TZTZULTZ1>UL1?1@TZTZTOTOTZ1?TZTZ1?V@TZV@V@V@TZTZ1>UPUUUPUU1>UUUPUU1>UUUUTETETEV7YBYBY81=1=Y8YK1>YBYB1>YKYK1>YK1?1?1@1AY0YK1AYKYK1A1BY0Y01B1CY0Y0Y)Y)1C1D1D1E1FY.1F1G1H1I1IY0YK1JY0Y01JY0Y0Y.1J1K1K1LYKYK1LY.1M1N1N1OZ)Z)YK1O1P1Q1QZ)1RZ)1R1S1T1UY.Y.1U1VY.1VY.1WY.Y.Y.1WY.1W1X1Y1Y1Z2#YMY.YMY.Y.1ZYMYMYMYMYMY.YM1YY.1ZY.1Z2#Z)Z)2#2$Z)Z)2$2%2&Z$2&Y.Z$2'Z)Z)Z)2'Z)Z)2'2(YO2(YOYOZ)2(2)2*2*YOYOYOY.Y.Y.2*2*2+2,2-Z$2-Z$Z$2-Z$Z$Z$2-2.Z$Z$2.2/YOYO2/2021222223YAYA2324Z(Z(YAYAZ(Z(Z'Z'2324YMZ'YMYMYMYMYM23YMYM232424Z'YMYMZ'Z'2425YMYM2526YM2627Y/2728Y/Y/Z'Z'Y/Y/2728Y/Y/28Z'Y/Y/Z$28Z$Z$Z$28292:2:Y/2;2<Y22<Y2Y22<2=Y2Y2YA2=YAYA2=2>Z(Z(2>2?Z(Z(Z(Z(2?2@Y2Y2Y22@Z(Z(Z(2@Z(2@2A2BY/Y/2B2CY/2C2D2E2E2FY2Y22F2GY2Y2Y2Y12GY1Y2Y22G2HY2Y22H2I2IY-2JY-Y22JY12KY1Y1Y-2KZ'2KZ'Z'2KYGYGYG2KY?Z'2LYGYG2LY?YGYGY?Y?Z'Z'2KY?2KY?Y?Y?YGYGY?YGY?Y?2JY?Y?Y?2J2KY?Y?Y?2KY?Y?Y1Y1Y?2JY4Y4Y4Y4Y12JY?Y?2J2K2KY?Y42LY4Y4Y42LY42LY?Y?2LY?2M2NY?Y?2NY1YGYGYG2NYGYGY?Y?2M2NY?Y?YIY?Y?Y?YIYIY?Y?Y?2LY?Y?2L2MY?Y?2MY?Y?Y?Y?Y?Y?2MY?Y?2MY?YIYIY?2MYIYIY?YIY?2LY?YIYIYIYIYSYIYI2KZ&2K2LZ&Z&YS2LYSYS2LYSYSYSYSYSZ&2LYSYSZ&Z&Y?2KY?Y?2KYIYIYIY?2K2L2M2MZ&Z&Z&YI2MYIYIZ&Z&Z&YI2LYIYIYI2LYSYSYSYSYS2L2MYSYS2MYSZ&WM2MWMYPYPYSYSYPYPYP2L2L2MYIY+Y+WMY+Y+Y+VXY+Y+WM2KWMWMX1X1VVVV2JX1VVX1VXVX2J2KVU2KVUVUVXVX2KVUW%W%VRVRX+X+2JX+2J2KX*X*2KW)W)W)W)W)X*W)2J2KWXWXW)W)2KWXWX2KWXWX2KX/X/X/WXWXWXX.WXWXWXX.2IX.X.X.X(WUX(X(2HTY2ITYTY2ITYTYTYTYTY2ITOTZTOTZ2H2ITO2J2JTZU3U3TZTZ2J2KTZ2KUUUU2KV@UUUUTOTOTOU32J2K2LU3TO2LTO2MTOU3TO2MU3U3U8U3TO2LTOTO2LU52MTOU3UUU3UUU32LU32MU3UUUUUU2L2MUUUUV@V@V@2M2MV@V@V@V@UUUUUUV@V@V@UUV@2KUUUUV@V@UUUUV@V@UUUU2IUUUUUU2IUUUUUUUUUPUUUPYD2HY@Y@Y@2HY@Y@2H2IY@Y@YDYD2IYDYKYK2IYKYD2IYDYDYKYKYDYDY@2HY@2IY@2IY@YDY@2IY@YDYKYKYDYDYKYKYD2HYKYK2H2IYKYK2I2J2JYO2K2LYK2LYKYKYOYO2LYO2LYOYKXTYKYKYK2L2LYOYKYOYKYOYKXT2KYOYOYOZ(2KZ(Z(YRYR2KYRYRYRZ(2KZ(2KZ(Z(2K2L2M2N2N2O2P2QY1Y1Y-Y-Y-2PY-Y-YLYLYL2PYL2PYY2QYL2QYYYYYYYYYY2QY-Y-2QY-2Q2RYUYU2R2SYYY,2SY,Y,Y,2SY1Y1Y12S2T2UYVY1Y1YVYVY12TYVYV2T2UYVYVYUYVYUYVYVYVYVY,YVYV2SYVY1Y12SY1Y1Y12SY12SYVYVYVYV2SYVYV2S2TYVYV2TY;2UY;Y,Y,Y,Y;Y,2TY,Y,Y,Y;Y;Y;Y;Y;Y,Y,YIYIYI2RX%X%Y;X%YIYIX%X%Y;2PY;2QY;2QY;Y;2Q2R2SX&2SX&X&X&Y;X&Y;X&YIYIX%YIX%X%2QX%YIYI2QYIYI2QYIW#X2W#X2W#X2X22PX2W#W#X2W#W#W#2OW#2O2PX&X&2P2QX&X&2QX&X&X&X&W#X&2QW#W#2QW#WVWVVWVWWVWV2P2QVWVWX&X&VWVW2PVWVWVW2PVW2PWV2QWVVW2QVWVWWVWVVWWVVW2PVWVWWVX$WV2P2P2QVW2RWVWV2RWVVRVR2RVRWS2RWSVRVRVRVR2RVRVR2RX$X$W'W'W'2QVRW'W'VRVRW'W'W'W'2P2QVRW'W'W'W'2PW'W'2P2Q2RX$X$X$2R2S2S2T2UW/X$2U2V2W2W2X2Y2Z2Z3#W'3$3$3%W'W'W/3%WV3&WV3&WVW/W/W/3&W/3&3'3(3)3)3*3+3,3,3-W'W'3-3.W'W'VRVRW'W'3-WXWPWPWXWX3-WPWX3-3.WPWX3.WPWPWPWPWP3.3.3/30WWWXWXWX30WXWXWX30WX30WPWP30X.WPX.WPWPWP303031WWWWUCUCUC31UCTYUCV&UC30UC3131V&V&V&UC31XRV?3132V?V?V?32V?V?V?32V?U2V?U2V?V?TYTY31TY31TYV&V&TYTYV&TYV&TYV&30V&TYV&TYV&V&U23/V&V&U2U2V&TY3.U23.3/TQTQ3/TOTOTOTO3/TOTOUUUU3/30TOUUTOUUTOTOTO3/3/UUUUUUUUUU3/UU3/UU30UU30UUTOUUTOUUUUUU3/YDYDYDYDYDS=3/3/YD30S=S=30S=S=S=S3S=30S3S330S330S3S3S3S330S331S3S3S331S331T*T*T*T)31T)Y;Y;3132Y,32Y,Y,32Y;Y,XX32Y;Y,Y;W032WI33Y;Y;W0W0Y;Y;3233Y;33343535W+W+W+W0W035WI35363738W&W&3839393:3;W23;W+3<W+3<3=VSVSW+W+VSVSW13<S<3=3=3>W93?Y;Y;3?3@Y;Y;Y;W+Y;3?W+W+W+W+W+3?W+3?VYVY3?Y;W+W+3?3@VYVY3@VYVYVY3@3AVYVYWTVYWTWTX&X&3@X&3@X&VY3AX&X&3AX&3AX&X&X&VY3A3B3C3CX&3DX&3DX&VY3EVYVYVY3E3EX&3F3G3GVWX&X&VWVWVW3GVWVW3GVW3GVWX&VWX&X&X&W:VWVWW:W:3E3FW:W:W:3FW:W:W:W:X&3FW/3FW:W:3FW:W:W:W:W:W:3FW:W:3F3GW:W<3GW<W:W<W<W<W:3FW:W:W:3F3G3H3HW<W<W<W<3HW<3I3IW?3JW?W<3JW<W<W<3J3K3LW<3LW<3M3MW?W?W?W?W?3MW?WWWWWW3MWWY'X(Y'V?U2V?V?TPTPUQUQV#3JV#V#UQUJUQ3JTP3JTPUQ3JUQUQUQUJ3JUJUJUJTOUJ3JTOTOUJ3JUQUQ3JUQ3J3KUJUJUNUQUN3K3KTOUJUJTO3KXPTOT)S<T)3K3KVSWTVSS<S<S<3K3KWTWTWTWC3KWCWCWCWCWT3KWTWTWT3KWT3KWTWTVZWQ3KWQWQWQWTWQWQWQW.W.X&X&WHX&X&3HW.3IW.W.W.WH3H3IWHWHWHX&3IX&3IXZWHWH3IW:3J3KX&3KX&X&W<W<W<W?W<W<W<3JW<W?W?W?3IW?W?W?W?W?3IW=3IW=W?W?W?W=W?W?3H3IW?W?W=3IW=W=W=W=3IW=W?W?3IW?X'X'W?W?W?W?W?3HW,W,3H3I3IW?W,W,3I3J3KW,3K3LW?W,X'X'W?W?W?W?W?X0W,3JW,W,3JW?W,W?W,W,3JW?W,W?W,W,X0WXWXWX3HWXX0X0WXWXW$W$WXWXWX3GWXWX3GWXWXWX3GWXWXX#X#X#X#Y&X#X(UKUKTA3EUKUKUNUNUN3DUNUNUM3DUM3EUMUM3ETKTK3ETKTDV*3EV*V:T.T.T.3EV8T/3ET/XHSDXH3ET%T%3ES@S<S<SKSK3DWTVQVQWTWTVQVQ3CX0W,X0X03CW$W$W$W$X0W$X-X-3B3CW$3CW$W$W$3CW$W$W$W$X-W$W3W3X-W33A3BWXWXUN3BUNU-U&V=U&V=V=V=V=UFT=T=3@T=3@TUTLTLTGTGTG3@3@V(TLTLS@S@3@S7S@3@3A3BS@S@S@3BS?S?XHSESESESESYS0T&S0S0T&3?S1S13?S1S1S1T&T$T&T&T$T$SNSNT$SNSNSNSPT&SP3<SPT'SPT'T$SNSNSNSN3:SNSCSNSCSNSC39SCSCSCSNSCSNSC38T#T#T#T#T#38T#38T#T#T#S4S4S2S2S4S4S2S2S4S4SBSBSBSB35SXW?W?W?W*34W$W$W$W$W$WNWNW$WNW$WNX0W$X0W$TLTLTG3131S0S0S0S0S0S0S1S0S0S0S1S13/S130SPSPSP30S130S1S1303132SPT'T'T'32T'32T'XGSNSNXTSTSCSCSTSCS630S6S6S6S630S630SRSRSRSRSRSR3030SJ31SJSRSR31SJSJSZSZSZ3031SJSZWAW$WAWAWAWAW730W730W7W7WA30W731WBWBWOWBWB30WBWBW(WBW(30WBWBWFWFU.U.UBU.U.U.U.UBU(U(3-U(U(U(U(3-S:S:S:3-S:3-XTSQSQSM3-SM3-SMSMSM3-SMSQSQ3-SMSQSQS:S:3-SMSRSJSR3-SR3-3.SLSRSRSR3.SLSLSL3.S;S;3.S;SRSASRSA3-SASLSLSL3-3.3/3/SZSZSZSA3/SASA3/SZSASZSZSZ3/SZ3/SASASA3/WFWFWFUG3/V)V)V)V)V)3/V33/V3V3V-V-T@3/V-V-3/UET@3/T@T@3/UET@UET@UET@T@V-U(3.V-3.U(V-V-V-V-3.V-V-V-V-UE3-V-UEUESQ3-SQSRSRSR3-SRSS3-SSSS3-SR3.3/SASASS3/SSS9S9S9SSSSSS3.S9S9S93.SU3.SU3/S93/SUSUW7WFW7WFUBUBUB3.UBV1V1V1V1UAV1V1V1V1V1UAUAUA3+T8UAUAT8T83*TJTJTJTJTJTJ3*TTTT3*V3TJV33*V3TJ3*TJV3V3T@T@T@SQSQT+T+SG3(SFSGSFSGSFSGSGSGSH3'S9S93'SUSG3'SGSGSGSG3'SGT83'T8T8T8T>T83'T23'T2T2T;3'T;T3T2T2T5T2T2T33&3'T3T3T33'T>T>3'T>3'3(T>T>T>3(T>TJT>3(T>T3T33(3)V33)T3T3T3T3T3V3V3T3V33(V3SF3(3)SHSFSHSHSHSFSFSF3(SHSHSH3(3(SVSVSVSHSHSVSVSHSH3'SW3'XFXFXFXF3'XFXFT6T9T6T6T83&T83'T6T63'3(3(3)T:3*T:T3T:T3T3T3T33)T3T3T8T8T3T33(T1T3T1T8T1T33'T1T1T8T1T8T1T33&3'URUR3'URUR3'UR3(URT33(T33)T3T33)T3T33)T3UR3)URURURV3V3V33)V3V3URURURV3URURV3V33'V33'URT1T1URUR3'URURURT1T13&SVSHSHXEX=XAX=X=3%X=XFXF3%XDXDX=XD3%XDXFXF3%XDXFXFXDXDXF3$XD3%V1T8V1T8V1T8V1T8T8T8V1T8T8T1T82Z2ZXDX=XDV1V1V1T2T72YT7T72YT7T7T7T72YT7T7Y9Y92Y2ZY9Y92ZY92ZY9Y9Y9YJYJ2ZYIYJYJ2Z3#YJYWYWYWY9Y9YIYIYIY>Y>Y>2X2YX1X)2Y2ZX)X)2ZX1X)X)Y62Z3#YBY6Y63#YBYBYB3#YBYBY63#Y6Y63#Y6Y6Y)3#Y)Y)3#Y.3$Y.Y)Y)Y)3$3$Y.3%Y.YJ3%YWYWYJYJ3%YJY5Y5Y.Y.Y5Y5Y.3$Y.3$Y.Y.3$Y.Y.Y.Y5Y5Y.Y.Y53#Y5Y53#YWYWYWY.Z'Y.Z'Y.2Z3#3$3$Z'Y.Y.Z'Z'3$Z'YNYN3$3%YNZ%Z%Z%YNYN3$YNYXYX3$3%YX3%YXYI3%YIYIYIZ'Z%Z'Z'Z'YGZ'YGZ'YGZ'Z'Z%Z%YGYGYGZ%YGYGYG2XYGYG2X2YYIYIY>YIY>Y>Y>Y>YPYPYPYP2WYP2WYIYZYZYIYIYZYZYI2VYIYIYZYPYZ2VYPYP2VYPYI2VYIYI2VYPYIYIYPYP2VYIYIYIYPYPYIYIYI2UYZYPYPYPYP2TYPYPYP2T2UX1Y>Y>YPYPYP2TYPYI2TYPYPYPYPYP2TX12TX1YPYPX1X12TX1YPYIYIYIYP2SX1X12SX1X1X1YIYIYI2S2SX12TX12TYIX12UX1X12UX1WLWLVRWLX1X12T2UX1X)X)X)WKWKWKW%W%W%VRW%WKWJWKWKWJWJW%WJ2PW@W@W@WJWJW%WJ2OW@W6W6W@W62OW6VB2OVBUC2O2PUCUC2PVBUCUCUCUC2PUC2PVBUCUCVBVBUCUC2OTHTHTHTOTO2OTYUY2OUYUYTOTOUYTOVD2NTOTOTOTZTO2NTZTZULTZTO2MTOTOUL2MTOTO2MULTOULTOTOTO2MULUL2MTOV@V@TZ2MV@V@2MV@UPUP2MUPUUUP2MUPUUUPUU2MY8YKY8YKY8Y8Y82LY<Y<YKYKYB2KYBYKY0Y02KY02KY0YK2LY02LY0Y02LY)2M2NY0Y02N2O2O2PYK2QY)Y)2Q2R2R2SY0Y02S2TY0Y0Y)Y)2T2UY)2UY)2V2V2W2XY.2X2YY)2Z2ZY.3#Y.3#Y.Y.Y.Y)Y)3#3$3$Y.3%Y.3%3&3'3(Y.Y.3(Y.Y0Y03(3)Y0Y0YKYK3(Y0YK3)Y0YC3)3*Y.Y.YCY.3)3*YKYK3*3+YKYKY.Y.3+Y.3+3,YKYK3,YKYKYKYKYKYK3,YKYKZ)YKYKZ)Z)3+YK3+YK3,3,YK3-YKZ)Z)3-Z)YKZ)YK3-YK3-YK3.3.YO3/YOYKYK3/30YOYO30YO3031YKYK31Y.323333Z'34Z'34Z'35Z'Y.Y.3536Y.Y.Y.36Y.3637YM3738YMYMY.Y.Y.YMY.37YMYM37YMY.YM37YMYMYMYK37YK3838Y.39Y.393:3;3<3<3=3>Z)3>3?Z)Z)3?3@Z)Z)3@Y.3A3BY.Y.Z$Y.3AZ$Z)Z)Y.Y.Y.Z$Z$Z$Z$3@3@YO3AYOZ)Z)YO3AZ)YO3AYO3AYOYOYOZ)Z)3A3B3BYOYOYO3B3CYOYOZ)YO3CYO3C3DY.3EY.Y.Y.3EY.Y.Z$Z$Z$Z$Z$YOZ$Z$YOYOY.3BZ$Z$Y.3B3CZ$YMYMZ$Z$YMZ$Z$Z$YOZ$YOYOZ$Z$YOYOZ$Z$YOYOZ$Z$3>3?YOYAYO3?YAYA3?YAZ$Z$3?Z$Z$Z$Z$YAYO3>3?3@3@YA3A3BYMZ'YMYMZ'Z'3AZ'YMYMZ$YMYMYM3@YMYMYM3@3AZ'Z'YMYM3@3AYMYM3AZ'3B3CYMYM3C3DYMYM3DY/YMYMY/Y/YM3CY/Y/Z'Z'Y/Y/3BZ'Y/Y/Z'Z'Y/Y/Z'Z'Y/Y/Z'Z'Y/Y/Z$3?Z$Z$3?3@Z$Y2Z$Z$Z$3@3@Y23AY23AY/Y/Y/3AY/3B3CY/Y/3CY/Y23CY2Y23C3DY2Y23D3EY2Y23EZ$YAYA3E3FYA3G3GY23HY2YAYAYAZ(3GZ(Z(Z(Z(Z(YRZ(Z(Z(YRYRY2Y23EY2Z(Z(YRZ(Y2Z(Z(Z(Z(Z(3C3DZ(Z(Z(3DY/Y/3DY23DY2Y2Y2Y/Y/Y/3D3DY2Y2Y23DY2Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/3B3C3C3D3E3FY23F3GY1Y2Y2Y23GY23GY23H3HY2Y-Y-Y23H3I3JZ(Y-Z(Y-Z(Y-Z(3IY2Y23IY13IY1Y1Y1Y1Y1Y-3IZ'YGZ'3IYGYG3IYGZ'Y?Z'Y?Y?Y?Z'Y?YG3GY?Y?Z'Z'Z'3GZ'Z'Z'Y?Y?Y?Y23FY?Y?Y13FY?Y?3FY?Y?Y?Y1Y1Y?Y?3EY?3EY4Y1Y13EY?Y4Y4Y?Y?Y43E3EY?3FY?Y?Y?3FY?Y43FY4Y4Y43FY43GY4Y43GY43GY?Y1Y13G3H3IY13IY1Y1Y1YGY?Y?Y?3HYGY?Y?YGY?Y?Y?Y?YIY?Y?YIYIY?Y?3EYI3FY?YIYIYI3FY?Y?Y?3FY?Y?YTYTYIY?Y?Y?Y?YIY?3DYI3DZ&Z&YIYI3DYIYSYSZ&YS3C3DYSYS3DYSYSYS3DZ&Z&Z&Y?Y?Y?YI3C3DYIYIYIYI3DYIY?Y?Y?3D3DYIYIYIYI3DZ&Z&YIZ&YIYIZ&Z&YIYIYI3BYSYSZ&YSZ&YSYSYSYSZ&YSYS3@YSZ&Z&WMWM3?X1X1X1Z&Z&Y+Y+3>3?Y+Y+WM3?WMWMX1X13?X1VXVXVXVUVX3>VUVUVX3>VUVU3>VUVUVU3>X+3?X+W6W63?X*W6W63?X*W6W)W)W)3>3?WXWX3?WXWXWXW)W)W)WXWXX/WX3>X/X/3>X/WXWXWX3>UCTYUC3>UC3>UCTYTHTHTYTYTYTOTOTOTZTZTZ3<TZTZTZ3<3<U3U4U3TZTZ3<3=TZTZTZ3=TZV@3=V@TZTZ3=3>TZ3>3?UUTO3?TOU33?3@U3U33@U3U3U33@U3TOU33@U33AU33AU83BU8TOU6TOTOU8U8TO3ATO3ATOTOUUUU3AUU3AUUUUUUU>U>U>3A3A3B3C3DV@UU3DUU3DV@3EV@3E3F3G3HV@V@3H3I3IUUUUUUYD3I3JY@YDYDY@3JYDYD3JY@YDYDY@Y@Y@3IY@3J3JYK3KYDYDYKYDYDY@YDY@YDY@YDY@YDYDYDY@YDYDYD3GYD3G3HYDYD3HYK3IYDYKYK3IYD3I3JYDYDYKYDYDYD3I3JYKYKYKYOYKYKYOYO3IYOYKYKYK3IYOYO3IYO3IYO3JYOYKYKYK3JYKYOYKYK3I3JYOYOZ(YRZ(Z(Z(YRZ(3IYRYR3IYRZ(3IZ(Z(YRYR3I3JYRYLYRYLZ(3IZ(Z(3IYLZ(YLZ(3IYR3J3JY-3KY-YR3KYRYRY-Y-YRY-Y-3JY-3KYLYL3KYYY-Y-3KY-Y-Y-3K3L3LYY3MYYYY3MYYYYY-Y-3MYUY-3MYUYU3MYUYUYUYUYUYYYUYUYU3L3MYUYUY,Y,Y1Y13LY1YV3LYVYV3LY1YVYVYVYVY-Y-Y1Y1YV3KY1Y13KY13K3L3MYVYVYVY,Y,Y1Y1Y13LY1Y13LY1YV3LYVYVYVY1YVYVY1Y1YV3KY1Y13KY1YVYVYV3KY,3KY,3LY,3LY,Y,YIYIYIX%X%X23KX2Y;X2X2X2X2X2Y;3JX2X23J3KX2X23KX2Y;Y;Y;3KX&X&Y;X&X%X%X%W#W#YIW#3IYIYIYIW#X2X23HW#3HW#X&X&3HW#X&X&W#W#3HW#X2X2W#X23GW#X2X&W#X&X&X&W#W#3FW#W#W#3FW#WVWVVW3FWVWV3FWVVWVWX&X&VWVW3EVWWVWV3EWVVWWVVW3E3EWVVWWVVW3EVWVWWV3EWV3FWVWVVW3FWVWV3FWVVW3FVWVW3FWVVWVWVRVRWS3F3FVRVRVRVRVR3F3G3GX$3HX$VRVR3H3IW'W'3I3JW'W'3JW'3J3KW'W'VRVR3K3L3LX$X$X$VRX$X$X$3K3LW/W/X$X$3L3M3M3NX$X$3N3OW/W/X$W/3OW/X$X$X$3OW/3OW/W/3OW/W/W/X$X$3O3PX$3PX$X$W/3P3Q3R3RX$X$3S3S3TW'W'3TW/W'W'W'W'W/W/W/3SW'3T3T3UW'3VW/W/3VW/WVW/3VW/3VW/WVWVW/W/3VW/3VX$X$X$3V3WX$X$X$X$3WX$X$X$X$3W3WW'X$3XW'W'3X3Y3YX$3ZW'3Z4#W'W'W'4#W'W'4#4$W'W'VRVR4$4%VRVR4%4&WXWXWX4&WXWXWXWP4%4&4'WPWX4'WXWP4'WPWPWPWP4'WWWWWPWPWP4'4'4(WWWW4(WWWWWWWX4(WXWXWXWP4(WP4(WXWPWPWXWX4(X.WPWPWP4(WW4(WWWW4(WWWWWW4(V&UCV&UCV&UC4(4(4)UCV&V&V&UCV&UCUCV?V?UCUC4'4(UCUCV?V?4'4(V?V?4(4)4*V&4*TYTYTYV&TYV&TY4)TYV&TY4)U2U2U24)U2U2U2TQ4)TQTQ4)TY4*TY4*TOTOTOTO4*TOTOTO4*TOU?4*UUU?UUTO4*TOUUTOUU4*UUUUUU4*UUUUUU4*4+TOUU4+UU4+UUTOUUYDYD4+YDYDYDS=S=YDYDYD4*YD4*S=S=S=S=S=4*4*4+S=4,S3S34,S34,S3S=S3S3T*S3S3S3T*S3T*S3S3S3T*S3T*T*T*T*T)T*T)4'Y;Y;Y;Y;Y;4'Y;Y,4'Y,Y,4'XXY,XXY;Y;Y;4'W0W04'W04'4(WIWIY;Y;W+W+Y;Y;4'Y;Y;Y;Y;4'W+4'W+W+Y;W+W+W+W+W+4&W+4&WIWIWIW&4&W&W&4&4'W&W&W&W&W&4'W&W&4'W+W9W&W9W9W&4&W9W9W9W9W94&W9W94&4'W94'W94(W&4(4)W+4)W+W9W+4)4*VS4+W+W+4+W+W9W9W14+4+W9W9W9W9W9W9W24*W2W2VSW9VSW94*Y;Y;W+W+4)Y;W+W+Y;Y;Y;4)W+4)W+W+W+VY4)VYY;Y;4)Y;Y;Y;W+4)Y;Y;VYVY4(VYVYVYY;Y;VY4(Y;Y;4(VYX&X&4(X&VYX&VY4(X&X&VYVYX&X&VYX&4&X&VYX&4&X&X&X&VY4&VY4'4'X&4(X&X&X&VYX&4'X&VYVYX&X&VY4'VYX&VYVYVYX&VYVYVYX&VYX&VY4$4%VY4%X&4&X&X&VWX&X&VWVW4%4&VWVW4&4'4'4(X&VWVWVWVWW:VWVWW:W:4&WV4'4(X&W:X&X&4'W/4(4)4)W:W:W:W:W:4)W<W:W:W<W<W:4(W<W<W<W<W:W<W:W:W:4'4'4(W:W:4(4)4*W<W:W<W<W<4)W<W<W<W<4)W<W<W<4)W<W<W?W?4)W?W?W?W<W?4(W?4)W<W?W?4)W?W<W<W<4)W?W?4)W?W<W<W<4)W<4)W<W?W<W?W?W?W<W?W?W?WWWWWWX(TOTO4&TOUJUJUQUJTPTPTP4%TP4%TP4&UJTOUJ4&UJ4&UJUJTOTO4&TOUQUQ4&UN4&4'UJUJTOTOUJ4'UNUQUNUQTOTO4&UJTO4&TOTOS<S<T)S<W9W9S<4%S<4%S<WT4%WTWTWT4%4&WCVY4&WTWTWTWTVZ4&VZ4&VZWTVZVZWQWQWQW.WHW.4%W.4%W.W.W.4%W.WH4%WHWHWH4%W.W.W.4%W.4&WHW:W:4&W<X&W<X&X&W<W<4%W<4%W<X&W<W<W<W<4%W<W?4%W?W?W?W?4%W?4%W?W?W?4%W?W?4%W=W?W=4%WXW=W=W=W=4%W?W?4%W?W,W?4%W?W?W?4%W?W?W,W,W?W,W,W?W,W,W?W?4#W,4#4$W,W,W,W,4$W,W?4$W?W?4$W,W?W,W?W?W,W,W?W?W,W,3Z4#4$4%X0WXX04%WXWX4%4&WXWX4&WXWXWX4&4'UKUK4'UNUQUQ4'UNUMTK4'TK4'TKTKTKUMTKTKTKTKTKTD4&V:VAV:4&4&4'4(4)V8V8V8T/SD4(SDT%T%T%S@4(WTWT4(WTW,W,W,X04'X-W$W$X-X-W$4'X-X-4'W$X-X-4'4(W$X-4(X-WX4(4)WX4)W44*4+4+U-UNU-T=T=TL4+TUTUTLTU4*TLTGTLV(V(TLTLS7S7S74)S@S@4)S7S7S7S@S@S7S@S@S@S@S@S8S84&4'S1S1S0S14'S1SPT'SPT'SC4&SCSCSNSCSNSC4%T#T#T#SCT#4%T#SC4%T#SC4%SXSXSXX0W$X0W$TGTGTG4$S0S0SYS0S1SP4#SP4#SP4$SPSPT'SPT'S1SPS1S1SPSP3Z4#SP4#4$4%S1SPS1S1T'T'T'4$T'4$T'T'S6S6S64$S6S6S64$SISISRSISR4#SRSJSJSJ4#SJ4#SJSRSJSRSRSRSJSJSJSJ3Z3ZSZ4#SZWAWAW7W7WAWAW7WAWAWA3Y3Z3Z4#W7W74#W(WBWBW(WB4#W(U(U(T04#U(U(V-U(S:S:SQSQS:S:S:SQSQSMSQSMSM3WSMSM3WSM3X3YSMSMSQSQ3X3Y3ZSM3ZSJ4#SJSJSJSJ4#SR4#4$SLSR4$SR4%SL4%SLSL4%S;SRS;SJSJ4%SLSLSLSL4%4%S;S;4&SA4&SASASJSZSJSZSZSZSA4%SZSZ4%SZ4%SZSASZSZSASASAWOWF4$WFUGV)V)V)V)4#V)TTV3T0V3V3V-V-3Z4#V-V-4#4$4$4%T@T@T@4%T@T@V-U(V-V-U(U(U(4$V-V-UE4$V-V-4$V-SQSRSQSR4#SRSSSR4#SRSSSSSRSRSSSRSSSSSS3ZSRSRSSSRSASASS3YSS3YSSSSS9S93YS93YS9SU3ZSU3ZSUSUS9S93ZS9UB3ZV1V13ZT4T4T8UAUAUA3ZTJTJ3ZTJTTTTTT3ZTJTJV3V3TJ3YTJV33YSSSGSGSHSGSHSHS93XSUS9SG3XSGSGSGSG3XSH3XT4T8T8T33XT3T3T;T;T2T;T;T3T;T3T23VT2T23VT3T2T3T3T3T33VT>T>T33VT33VT3T33VT>T>T>3VTJT>TJ3V3WT>3X3XV3V3V33XV3V3V3T>3XT3T33XV3V3V3SFSF3XSHSFSFSF3XSFSHSHSHSHSH3W3XSH3XSH3YSHSWSWSWX>X>X>XF3W3XXFXFT6T63XT63X3YT8T83YT6T83ZT6T63ZT6T:3ZT:T:T3T33ZT3T:T3T:T33Y3ZT1T13ZT3T1T1T33ZT1T13ZV34#URT3URT3URV3V33Z4#T3UR4#UR4#URURURT3T3T34#T34#T3T34#T3T14$T3T3T3URURUR4#URV3V34#4$V3V34$V3T3T3T1T14#URT1UR4#SVSHSVX?X?XFX?XFXF3ZXFX=XDX=XDXD3YXDXDXFXF3Y3Z3ZXDXDXDT83ZT8T8X=XDX=XD3Y3ZT7T73Z4#T7T7T74#T7T7YW4#YWYW4#4$YW4%Y9Y94%Y94%4&Y9Y9YJYIYIYIYJYJYIYIYJYJYIYIX14#X1X14#X1X)X)X1X14#4$X1X1X)X)X1X1X)4#Y64#YBYBY64#YBYBY64#YBYBYBYB4#YBY64#Y6Y6YBYB4#YBY)4#Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.3YY)Y.Y.Y)Y.3YY.3YY.Y.Y.YJYWYWYWYJYJ3X3YY5Y5Y53YY.3YY.Y.3YY.Y.Y.YWYWY53YY5YWY5Y5Y.Z'Y.Z'Y.Y.Y.3W3WZ'3XZ'3XZ'Y.Y.Z'Z'3XZ'3X3YZ%Z%YNYNZ%Z%YNYNZ%Z%YN3WYNYN3WYX3XYXYXYIYXYXYIYI3WYIYGYIYGYGY>Y>YIYIY>Y>YIYIY>YPY>Y>YIYIYIYZYZYZYIYZYZYPYZYZYPYP3PYPYIY>YIYIY>Y>YIYIYPYIYIYIYIYIYIYPYZYPYPYPYPX13KX1YP3KYPX1YPYPYP3KYPYP3K3LYPYP3L3M3MX1YPYPX1X13MX13MX1X1X1YI3MYIYIYI3MYI3NYIYI3NX13NX1X1X13N3OYIYI3OYIX1X13OX1WRWRX13OX1X13O3PX)X)3P3QW@W@W@W@W@3Q3QW6W6W6VBVBVB3QVBVB3QVBVBVBVB3QVBVB3QVBVBUCVBUCVBVB3P3QUCTHTHTHTYTOTYTYUY3OUYUYVDVD3O3PULUL3PULULULTOTOTZTZULUL3NUL3OTOTO3OTOTOULUL3OTOV@V@TZTZV@V@3NTZUPUP3N3OUUUUUU3OUP3OUUUUY8Y8Y8Y<YBYBYBYKYKY0YK3MYK3MYKYKYKY0YKYKY0Y)Y0Y0Y)Y)3KY)Y0Y)Y0Y03JY0Y0Y0Y03J3K3L3L3MYK3NY03NYKYKY0Y03N3OYK3OYKYK3OY)Y0Y03O3PY0Y0Y)Y)3P3Q3QY)Y0Y03QY)Y03RY)Y)3R3S3S3TY0Y03T3UY0Y0Y)Y)Y)3U3U3VY)3WY)Y)3W3XY)Y)3XY.Y.Y.3XY.Y)3XY)Y)Y)3XY)Y)3X3Y3ZY.3ZY.Y.Y.3ZY.Y.Y.Y)3Z4#4$Y)Y)4$4%Y)4%Y)4&4&4'4(4)4)Y.4*Y.Y04*4+4,4,Y.Y)4-4-4.Y0Y0Y)4.Y0Y0Y.Y.4.Y.YK4.YKYK4.4/YKYK4/40YKY0Y0Y0YKYKY0YCY04/YCYC4/YCY04/404141YC4243YCYC43YC43Y.44Y.Y.Y.4445YK45YKYK4546YKYK46Y.YKYKYKYKYKZ)Z)Z)Z)45YKYKYK45YK45YKYK4546474848YKYKYKZ)Z)4849Z)Z)YKYKYK48YOYOYKYOYK4848YOYOYOYOYO48YOYK4849YOYKYOYOYO48YOYOYOY.Y.YKYKY.Y.YK47Y.Y.47Y.YK47484949Y.Y.Y.49Z'4:Z'Y.4:Y.4;Y.4;4<Z'Y.4<Y.Y.Y.Y.YMYMY.YM4;YMY.Y.Y.4;4;4<YMYM4<YMYMYM4<Y.4=Y.Y.4=4>4?Y.Y.Y.YMYMYMY.Y.Y.YMYMYM4<4=4>Y.4>Y.Y.Y.YKY.4>Y.4>Y.4?Y.4?Y.4@4AY.Y.4AY.4A4BZ)Z)4B4CZ)Z)Y.Y.Y.4CY.Y.4CY.4CZ)Z)Z)Z)4CZ)4D4D4EZ)4FY.Y.4FZ)Y.Y.4FZ)Y.Y.4FY.Z)4FZ)Z)4FZ$4GZ$Z)4GZ)4HZ$Z$4HYOZ)Z)Z)YO4GYOYOYO4G4HYOZ)Z)4H4IYO4I4JYOYOZ)4JZ)Z)4JYOYOYO4JZ)YOYOYOZ)YOYOYOYO4IYO4I4JYOYOY.4JY.4K4K4LZ$Z$Z$Z$4LZ$Y.Z$Z$Z$4KZ$Y.Y.Y.Y.4K4LY.Y.Y.4LZ$Z$YOYAZ$Z$YA4KYO4KYO4LYAYA4LYAZ$Z$4LZ$YO4LYOYOYOYOYOZ(YOYOZ(4K4KYA4L4MYO4MYAYA4MYAYAYAZ'Z'YMYMYMYM4LYMYMYM4L4MYMYM4MYMZ'Z'4M4NZ'Z'YM4NZ'Z'4N4OYM4OYMYM4OZ'4P4QYMYMYM4Q4QYM4R4SYMYMY/Y/YMY/4RY/Z'Z'Y/Y/Z$4QZ$Z$4Q4R4S4T4TZ$Y2Y2Z$4T4UY2Z$Y2Y2Y2Z$Y2Y2Y24SY/Z$Y/4SY/Z$4TZ$4TZ$4U4U4VY2Y2Y/Y/Y24V4V4WY2Y2Y/4WY2Y24W4XY2Y24X4YY2Y24Y4ZY2Y2Z$Z$Z$4ZZ$YA4ZYAYAY2YAYAYAYAYAZ(Y2Y24XY24XY2Z(Z(YA4XZ(Z(Y2Y24XY2Z(4XZ(YR4XZ(YRYRZ(Z(YR4XY2Y24XY2Y/Y/4XY/Y/Y2Y2Y2Y/Y/4WY24W4XY2Y2Y2Y/Y2Y2Y/Y/Y2Y2Y/4VY/4W4WY?Y?Y?4W4X4YY2Y?Y?4YY?Y2Y14YY1Y24YY2Y1Y2Y2Y2Y-Y2Y2Y24X4XY-Y-Y-Y2Y24XY2Y2Y24XY2Y-Y1Y-4XY1Y14XY1Z(Z(Z(Y-Y24WY2Y2Y2Y1Y1Y1Y-Y14VY1Z'YGZ'Z'YGYGZ'4UYGYG4U4VZ'Z'Z'Y?Y2Y?4UY1Y14UY1Y14UY?Y1Y14U4VY4Y4Y4Y4Y14VY44VY44WY4Y?Y4Y4Y4Y?Y4Y?Y4Y?Y4Y4Y4Y?4T4UY44UY4Y4Y44UY44VY44VY4Y4Y4Y4Y44VY14VY1Y1Y?Y?Y?4VY?Y?4VY1Y14VY1Y1Y?4VY1Y1YGYGY?Y?YIYI4UYIY?4UY?Y?4U4VY?Y?Y?YTYTYT4UYIY?YIYIYIZ&Z&YIYI4TYIYIYIYSYSYIYIYSYSYIYIYSYI4QZ&Z&Z&Y?Y?YIYIY?YIYIYI4OYI4P4QY?Y?Y?4QY?YI4QYIYIYI4QYIYIYIYSYSYSYS4PYSYPX1X1X1Z&Z&Y+Y+4NY+Y+Y+X14NWMWMX1X1X14NVXVXVU4NVXVXVUVUVXVX4MVUX+X+4MX+4MX+X+X+X*4MX*X*4MX*X*X*WX4MWXWX4M4NWXWXW)W)4N4OWXX/WX4OX/X/4OX/WXX.X.X.UCTY4NTY4NTYUCTYTZTZ4NTZTZTZTZ4NTO4NTOTOTZTZ4NTZTZTZ4NTZTZ4N4OV@4O4PV@V@TZTZTZ4PTZTZ4P4Q4QV@TZV@TZTZ4QUU4QU44RU9U44RU9U94RU3U3U34RU3U3U3TOU3TOU3TOU3TOU3TOU3TOU3TOU8TO4O4OU8U8TOTOU7TO4OTO4OTOTOUUUU4OUU4OUUUUUUU>U>U>UUU>4NU>U>UUUU4NUUU>U>UUUUU>UUUUUUV@UUV@4L4LV@4MV@4MV@4NV@V@4NV@V@UUUU4NUUV@V@UUUU4MUUUUUUV@V@V@4MV@V@4MUU4MUUUUUUYDYD4MY@4MY@Y@Y@YDYDY@Y@YDYDY@Y@YDYD4KYD4KYDYDYDYDYK4KYK4K4LYDYDYDYD4LYDY*4LY*Y*4LYKYDYDYKYK4L4M4MYKYDYDYDYKYDYDYKYK4L4MYKYK4M4NYK4NYKYKYOYOYKYKYO4MYKYKYK4MYKYKYOYOYKYKYKYO4LYO4LYOYKYOYKYKYKYOYO4KYO4L4LYO4MYOYRYRZ(YRYRYRZ(YR4KYRZ(YRZ(YRZ(Z(YRYR4JYRZ(4JZ(Z(Z(YRZ(4JZ(Y-YRYRYRYRYR4IY-Y-YRY-4HY-Y-Y-YR4HYRY-Y-Y-Y-YVY-YVY-Y-YLYLYLYYYLY-Y-Y-YYY-YYYYY-Y-YYY-YLYYYLYYYLYYYLYYYYYU4@4AY-Y-YU4AY-YUYUYUYUY-YUYUYUYUY,Y,YUYUY,Y,4=Y14>4?YV4?YVY14?Y1Y1Y1Y1Y1YV4?Y1Y14?Y1Y1Y1Y14?Y1Y14?YVY14?YVYVY1Y1Y14?Y1Y14?Y1YV4?YVYVY1Y1YVYVY1Y1YVYVYVY;Y;Y;4<Y;4=Y;Y,Y;Y;Y;Y,4<Y,4=X2X2Y;X2Y;4<Y;Y;4<Y;Y;Y;Y;X2Y;Y;X2X24;X2Y;X&4;4<W#YIW#W#W#W#4;W#W#W#4;4<4<W#X&X&W#W#4<4=X2W#4=W#W#W#X&X&W#W#4<W#4<WVVWVWWVWVVWVWVWVW4;VW4;WV4<WVWVWVVWWV4;WVVWWVVWWVVW4;WVWVWVX$WV4:WVWVWVWVVWVWWVWVVW49VW49VW4:WVWV4:WVVRVR4:4;WSVRVRVRVR4:VR4;4;4<X$X$VRVRVR4<4<X$X$X$VRVRW'W'VRVRW'W'W'W'W'4:W'W'4:4;X$W'X$4;W'4;W'W'VRVR4;4<VRX$VRX$4;X$X$X$4;X$X$X$X$X$X$4;X$X$4;X$4;4<W/W/4<4=W/W/X$X$4=4>X$4>W/W/4>4?W/W/4?4@W/W/X$W/W/W/X$X$X$W/X$4>W/W/4>W/W/W/X$W/W/W/X$X$W/X$4<4=X$X$W/4=4>4?W/X$4?4@X$X$4@X$4@X$X$X$X$X$4@4AW/W/W/4AW/W/4A4BW/W/W'W'X$X$4A4B4BW'W'W'4BX$4CW'4CW'4DW'4D4E4F4GW/W/WVWVWVW/WVW/4E4FWVWVW/W/W/4FW'4FX$X$X$4FX$X$W'4F4G4HX$X$4HX$X$4H4IW'W'W'W'4I4I4JX$X$W'W'4J4KW'W'4K4LX$X$X$4L4LX$W'W'4L4M4N4O4O4PW'W'4P4QW'4RX$4R4SW'4SW'W'W'W'4SW'W'4SW'W'W'W'4SW'W'4SW'W'W'WXWX4S4TWXWXWX4TWXWP4TWPWX4TWPWPWX4TWXWPWXWX4TWPWPWPWW4TWP4TWWWWWP4T4U4VWPWPWWWWWPWW4U4VWXX.WX4VWX4VWPWPWXWX4VWPWXWXWXX.WPWP4UWWWP4UWWWWWP4U4VWWUCV&UCV&V&V&4UV&UC4UUCUC4UV&V&V&4U4VV?V?4VV?V?V?UCUCV?4VUCUC4V4WUC4WV?V&4WV&V&V&4WV&U2U24W4X4Y4ZV&TYV&TY4Y4ZU2U24Z5#U2U25#5$TQ5%TYTY5%TY5%TYTQTQ5%TOTYTOUUUUTOUUTOTOU?U?U?UUU?U?TO4ZUUUUTOUUUUUUTOUU4YUUTOUUTOTOUUUU4XUUTOTOTO4XTO4XTOTO4XYDY@YDYDYD4XYDYDS>4XS>4X4YS=S=S=S3S=4YS3S34YS3S=S3S=S=S3S34XS34XS3S=S3Y;Y;Y,Y,Y;Y;Y,Y,Y,Y;Y,Y,4UY,Y,Y,Y;Y;Y;Y,W0W04T4UWI4UWIWIW0W0WIWIY;Y;4TW+Y;4TW+W+Y;Y;W+Y;4SW+W+W+W04SWIWI4S4TW&W&4T4UW&W&4U4VW&W+W&W&W&4VW&W&4VW+W&4VW&W9W9W9W9W24U4VW2W2W9W9W9VSW9W24UW2W9W2W9W9W&W+W&W+W&W&4S4TW94TW9W9W9W+VSVSW+W+VS4SVS4SVSVS4S4TVSVS4TW94UW9W14US<W9W9W24UW24UVS4VVSY;Y;Y;W+Y;Y;W+4UW+W+W+4UW+4UVYVYY;Y;4UY;Y;4UVYVYW+VYW+VYVY4TVYVY4TVYVYVY4TX&4UX&X&X&VYX&VYX&VYX&VYVY4S4TVYVYVY4TVY4TVYVYVYX&4TX&4TX&VYX&VYVYVY4T4T4UVYVY4U4VVY4WVYVY4WVYX&X&4WX&VYX&VY4WVWVWX&4WVWVW4WX&VWVWX&4WVWVW4WVWX&4WX&X&4WVWVWVWWVWVW:WVW:4VW:W:4VW:W:W:W/W/4VW/W:4VW:W:4VW/4WW:W:W:4WW:4WW<4XW<4XW<4YW<W:W<W:W<W:4XW:W:4XW<W:W<W:W:W:4XW:W:W:4XW:4X4Y4Z4ZW<5#W<W<W?W<5#W<5#W<W<W<W?5#W?W<W?W<W?W<W?W<W<4YW?W<W?W<4YW<4ZW?W?4ZW?W<W<4Z5#5#W?W<W?TOTO5#5$TPTPUQTPUQUQ5#UQ5#UQTPUQ5#TO5$TO5$TO5%5&TOTOUJTOUN5%UNUN5%TOUJ5&TOTO5&TOUJ5&UJ5'TOTO5'UJTO5'TOUUW9VS5'VSS<S<S<WT5&WTWTWTVY5&WCVY5&X&VYVYWC5&WTWTWTWTWTVZWTVZWTVZW.WHW.WHW.WHW.5#W.5#W.5$5$WH5%WHWHWH5%W.5%W.W.W.W.W.W.WHX&W<X&W<W<W<5#W<5#W<X&X&W<W<W<W?W<W<W<W?W?W?W?4YW?4YW?W=W?W=W?4YW=W=4YW=WXWXW=4Y4Y4ZW?W?W?W?W,W?W?W?W?W,W,W,W?W,W?W?W,W?W?W?W,W,W?W,W,W,W,W,W?W?W?4SW?W?4SW,W?W,W,W,W,4S4SW?4TW?W,4TW,W,4TW?4UW?WXWX4U4VWXWXWX4VWXWX4V4WWXWX4WWXWXWX4WX#4WWXX#WXTATATA4W4W4XUNUNUMTKUMTKUMTKUMTK4VTKTDTDVAVAV:V:T.T.T.4UT.T.4UUHUHUDUDUD4TV6V6V6SDT%4TT%T%T%S@S@WTWTWTVQX0X04RX0X-4RW$4SX-4S4TW$W$4TW$4UX-X-4UX-W$4UW$W$WX4UWXWX4U4V4W4X4XW4W4W4W4W4WXWXW4W4WXWXUNUNUNU-T=T=TLTLTG4TTG4US7S74US7S@S7S7S7T&T&S1S1T&T&S1S1S0S0S0S1SC4QSCSC4QT#4RT#SC4RSCSC4R4SSCSCSBSBSBSXTGTL4RTLS1SPS1SPS1SPS1SPS1SPS1S14OSPS14PSPSP4PSP4PT'SPT'SP4PSPSP4PT'T'T'T'4PT'4QT'4QT'4R4R4SSMSMS6S64S4TSR4TSRSJSJSJ4TSJSR4TSRSRSJ4TSJSZSJSJSJSZ4SSZSZSZWAWA4S4TWAWA4T4U4UWYWYWYWYWY4U4VWBW(WBWBW(4UWBWB4UU(4VU(SMS:4VS:SQSQSMSMSMSMSQSMSMSMSMSQS:4SS:4T4T4USMSMS:SMSMSMSRSJ4T4U4USJSRSJSJSJSLSJSRSR4TSLSR4TSRSLSRSL4TSL4TSLSRSRSLSLSLS;SR4SSRS;SJSJSJ4SSLSASLSA4R4SS;S;S;4SS;S;4SSASASASZSZSA4SSZSZ4SSZSASA4SSZWOWFWFWFV)4RV)TTT@V-V-V-V-V-4QV-T@V-T@4QV-UEUEUEV-4PT@T@4PT@T@T@4PUET@T@U(V-V-V-V-V-UEUEV-V-UEUE4MSRSSSSSRSSSSSSSS4LSSSSSASASS4L4LSSSSSSS9S94LS94LS9SUS9S9S9SU4LSU4LSUSU4LS94M4NUBV1V1V14MUAT4T4UA4MTJTJTJTJ4MTJTTTT4MTTTJTJTJ4M4MSSSGSSS9S9S94MSGSGSG4M4MSHSHSHT4T4T8T4T3T>T3T3T24KT2T24KT3T2T3T3T3T34KT3T>T34KT34KT3T34KT>4LT>4LTJT>TJT>T>T>4LV3V34LV34LV3T3T3T34LT3V3T3T34L4MT>T>4M4NT34NV3V3SFSFSFSHSFSFSF4MSH4MSVSV4MSVSVSVSHSH4MSV4MSVSVSVX>4MXFXF4MXFXFXFT6T6T8T6T84LT8T8T6T64LT8T6T6T84L4L4MT8T8T6T64MT8T3T3T:T3T3T34L4MT34MT3T14M4NT14OT3T3T1T14NT1T1T1T3T34NV34NURURURURV3UR4NV3V34NV3T3T3T34N4NURT3URT34NT3T3T34NT34OT3T34OT3T3T3T14OURUR4OURV3V3V34OV3V34OV34OURURURURURT14OSHSVSH4OXFXF4O4PXD4PXDXDXFXF4P4QXFXF4QXDXD4QXDXD4QT1T8T84Q4RT7T7T2T2T7T7T24QT7T74QT2T7T7T24QT7T7YWY9YW4QY9Y9YWYWY9Y94PY9YW4PYWYW4PY9YWYWYWYWYWY9YW4OY9Y9X1X1X14OX1X14O4PX)4PX)X)4PX)X)X)4P4QX)X)Y6Y64Q4R4R4S4TYB4T4UYBYBYBYB4U4V4VY6Y6Y6YBYB4V4WY.Y.4WY.Y)Y)Y.Y.4VY.4WY.4WY.4XY.YJYJ4X4YYJYJ4YYJY5Y5Y.Y.Y54XY.Y.4XY.Y.Y.YWYWY54XY.Y.Y.Z'Y.Z'Y.Z'4VZ'Z'Z'Y.Z'Y.4VY.4VY.Z'YNYNZ%Z%YNYNZ%4UYX4UYNYNYXYX4UYX4UYNYNYN4U4V4WYI4W4XYZYPYPX1X1X1YP4WYPX1YPYPYP4WYPYP4W4XYPYP4XYPYPYP4X4Y4YX14ZX1X1X1YPYPX1X14YX1YPYP4YX14Y4ZYIYIYIYIYI4ZYI4ZYIX1YIYIYI4Z4ZX1X1X1YI4ZX1X1YIYIX1YIYIYIX14YX1X1WR4YX1X1X1X)4X4YX)X)4YX)X)X)WJWJW@4Y4YWJW@W@W64YW6W6W@W@W@W6VBVBVB4XVBVB4XVBVBVBVB4XVBVB4X4YVBVBVB4YVBVB4YVB4YTOUY4Z4Z5#VDTO5#TOTOTO5#UL5$5%ULUL5%UL5%5&TOTOTOULTO5&5&TOTOTO5&5'TZTZUPUPUP5'UPUP5'UPUUUPUUUPUPUP5&UPY0Y0YK5&YK5&YKYKY0Y)Y05&Y)Y)Y0Y0Y0Y05%5&5&5'YKYK5'YKYKYKY0Y05'5(Y0Y05(Y05(5)YK5*Y0Y0Y05*5*5+YKYK5+Y05,Y05,Y0YKYKY)Y)5,Y)Y)Y)5,5-5-5.Y0Y0Y)Y)5.5/Y)Y05/50Y)Y)Y0Y)Y)Y)Y)Y0Y0Y)Y0Y05-Y0Y0Y0Y0Y)Y05-Y05-Y0Y0Y)Y)5-Y0Y)5-Y0Y05-Y)5.5/Y)Y)Y.Y.Y)5.Y)Y)Y.Y.Y)Y.Y)5-Y)Y)Y)5-Y.Y.5-5.Y.Y.Y)Y)Y.Y.Y.Y.5-Y.Y)Y.Y)Y)Y.5,Y)5-Y)Y)Y)5-Y)5-5.Y.Y)Y.Y.Y.Y.Y.5-Y.5-Y.Y.Y.Y)5-Y)Y)5-5.Y.Y.5.Y.Y.Y.5.Y0Y0Y0Y)5.Y05/Y)Y)Y)5/Y)5/Y)50Y)50Y)Y)Y.Y.50Y.Y)Y)Y)50Y.Y.50Y.5051Y.Y.51Y.52Y.52Y)53Y)Y053545555Y)Y)Y)55Y)56575758Y)59595:Y05;Y)Y)5;Y)5;5<Y)Y.Y.Y.Y0Y.Y0Y0YKYKY0Y0YK5:Y0Y05:Y0Y05:YKYKYKY0YKY0Y0YCY059YCYC59YCY0Y0Y059YK59YKYK595:YKYK5:YCYCYCYCYC5:5;YCYCYC5;YCYC5;YKYCYC5;5<5<Y.YCY.YK5<YK5=Y.Y.5=Y.5=Y.YKYK5=5>5?YK5?5@YKYKY.Y.5@5AZ)Z)YKYKYK5@Z)Z)Z)5@YKYK5@5A5BZ)5B5CYKYK5CZ)Z)5DZ)YK5D5E5E5FYKYKZ)Z)YKYKZ)Z)YKYKYKYKYOYOYKYOYK5CZ)Z)YOYOYOYO5BYOYKYK5B5CYKYOYKYK5BYOYOYOY.5BYKYKY.Y.5BY.YK5B5C5DYKYK5DY.5DY.Y.Y.5DY.Y.Y.Y.Z'5DZ'5DZ'5EZ'Y.Z'5EZ'5EZ'Y.Y.Y.5EY.5FY.Y.Y.Z'5EZ'5FZ'5FYMYMYMY.Y.Y.5FY.Y.YMYMY.Y.YMYMY.YMYMYMY.Y.5CY.YMY.YMYMY.5B5CZ'Y.5CY.5D5DZ'Z'Z'YKYKYK5DYK5D5EY.YK5EYK5F5F5G5HY.YKYKYK5HYK5HYKYKYKY.5HY.5HY.YKY.5HY.YK5IY.Y.5IY.Y.Y.Y.5I5IZ)Z)Z)5I5JZ)Z)5J5KZ)Z)Z)5KZ)Z)Y.Y.Y.5KY.Y.5KY.5K5LZ)Z)Z)Y.Z)Z)5KZ)Z)Z)Y.Y.5KY.Y.Y.5KY.Z)Y.Z)Z)Y.Z)Z)Z)5I5JZ)Z)Y.Y.Z)Y.Y.Y.Z)5IY.Y.Z$Z$5HZ$5IZ$Z)Z$Z)5I5IZ$5JZ#Z$Z$Z$YOZ)Z)Z)YOZ)Z)YOYOZ)Z)YOZ)Z)Z)Z)YOZ)Z)Z)5E5EZ)5F5GZ)YO5GYOZ)Z)Z)5G5GYO5HYOYO5HYOYOZ)5HYOYOZ)Z)Z)5HZ)YO5HYOY.Y.Y.5H5HZ$Z$Z$Y.Y.Z$Z$5GZ$Z$Z$Y.Z$Y.5GY.5GY.Z$Y.Y.Y.5GY.Y.5GZ$Y.Y.Y.Z$YAZ$YAYAYOYOYOYA5DYA5E5FYAYA5FYAZ$Z$YAYAYOYOYO5EYAYAZ(5E5EYAYAYA5E5FYOYOYAYA5F5GYOYO5GYO5GYA5H5IYMYMZ$YMYMYMYMZ$YMYMZ$5GYMYM5GYMZ'Z'YMYMZ'YMYMYMZ'Z'YM5EZ'Z'5E5FZ'Z'5FZ'YM5FYMYM5FZ'YM5GYM5GYMYMZ'Z'5GZ'YMYMYMY/YMYMYM5F5FY/Y/Y/5FY/Y/Y/YMY/Y/Y/YM5EZ$Z$Z$Z$Z$5EZ$Z$5EY2Z$Y2Z$Z$Y2Y2Z$Z$Z$Z$5CZ$Z$Z$5CZ$Z$5CY2Y25CYMZ$YMZ$5CZ$5D5D5EZ$5FZ$5FZ$5GZ$5GZ$Y25GY/Y2Y2Y/Y/Y2Y2Y/Y/Y25FY25FY2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y25DY/Y/5D5EY/Y/5E5FY/5FY2Y25FY/Y2Y25F5GY2Y2Z$5GYAYAZ$5G5H5IY2Y25IY25IY2YAYAYAYAYA5IY2Y25IY2Z(Z(5I5JZ(Z(5JZ(5JZ(YR5KY2Y25KY2Y/Y/5K5LY25LY2Y2Y/Y2Y2Y25KY2Y2Y2Y/Y/Y/5KY/Y?Y?Y?Y/Y?5JY?Y/Y/Y/5JY?Y?5J5K5K5LY2Y2Y?Y?Y2Y?Y2Y1Y1Y1Y2Y1Y1Y1Y2Y2Y25IY25IY-Y-Y2Y25IY2Y2Y2Y25IY-Y1Y-Y-Y1Y15H5IY25IY2Y1Y-Y-Y-Y15HYGZ'5IY?5IY?Y?5IY?Y?Y?Y2Y1Y1Y1Y?Y?Y15HY?Y?5HY1Y?Y?Y4Y4Y?Y?5GY?5GY4Y1Y4Y?Y?Y4Y4Y45FY4Y4Y4Y?Y4Y4Y?Y?Y4Y?5DY?5EY?Y?Y?Y45EY45EY45FY45FY4Y?Y4Y4Y?Y?5EY?5FY?Y?5FY?Y15FY?Y1Y15FY1Y1Y1Y?5FY1Y1YIYIY?5F5FYIY?YIYIYIY?Y?YIYIY?Y?YIYI5D5EYIYIZ&Z&YSZ&Z&Z&YIYIY?5CY?5C5D5EYIYI5EYIY?YIYIYIY?YI5DYIYIYIYI5DYSYSZ&Z&Z&Z&5CY+X1X1WMWMX1X1VVVVVX5AVUVU5AVUVUVUVRX+VR5A5A5BX+X+5BW6X*X*W65B5C5DW)W)WXWXW)W)WX5CW)W)5CW)WXW)WXWXW)W)WXWXWX5AWXWX5A5BWXWXUCUCUC5B5B5CUCUCTZTZ5C5DTZTZ5D5ETO5ETO5FTZTZ5F5GTZTZ5G5HTZTZ5H5ITZ5ITZ5JTZTZ5JV@TZV@V@V@TZTZTZ5ITZTZ5I5JTZTZ5J5KTZ5KTZ5LTZTZ5LUUU4U45L5M5MU9U9U9U4U4U95M5MU35NU35N5OU3U3TOU85OU8TOU8U8U8TOU7TOU7TO5MTOTOU3UU5MUU5MUUU3UUU>UUU>5M5MUUU>U>5MUU5NUUTZTZTZ5NTZ5N5OV@5OV@5PV@5PV@V@V@5PUUV@V@5PUUV@5QV@UUUUUUV@V@V@5PV@UU5PUUUU5PUUUU5P5QY@Y@YD5Q5RY@Y@Y@Y@5R5RYDYDYDYDYDYD5RYD5RYDYD5RYKYDYDY@YD5RYDY*5RY*Y*YKYKY*Y*YK5Q5R5SYKYK5SYKYD5SYDYDYKYK5S5TYKYKYDYDYKYK5S5TYKYK5TYKYKYOYKYOYOYO5SYOYKYK5S5TYKYO5TYO5TYOYKYOYOYOYO5TYO5TYOYOYOYO5T5U5U5VYOYO5V5WZ(5X5XYRZ(5Y5YYRZ(Z(5YYLZ(5ZYRYRYR5ZYRYRYRY-YRY-YRY-YY5XYY5Y5YYUYUYUY-Y-YUYUY1Y15XY1Y-5XY-Y-5X5YY-Y-YVYV5YY1YVY1Y1Y1YVY1YVYVY1Y15W5XY1Y15X5Y5YYVYVYV5YYVYVYVY1Y1Y15YY1Y1YV5Y5YYVYVYV5YY;5ZY;Y,5ZY,6#Y,Y;Y,Y;5ZY;Y,Y;X2X2Y;Y;X2X2Y;Y;X2X2Y;X2Y;Y;5W5XX&X&5XX&W#W#5XW#W#W#X&X&5WW#X&X&X&5WX&X&W#W#X&X&W#W#5V5WX2X25WW#W#W#5W5XWVWVVWVWX&VWX&X&5VWVVWVWVWVWVWWV5UWV5VWVVWWVVWVWWVWV5UW/5UWVVW5VWVWV5VWVVW5VVWVW5VWVVWVWWS5VWSWSVRVRWS5VVRVRVR5VX$5VX$X$5V5W5XX$5X5YX$X$VRX$X$X$5X5YX$X$W'W'W'5YW'W'5Y5Z5ZX$X$X$5ZW'X$W'VRVR5Z6#W'6#W'W'VRVRW'W'5Z6#X$X$VRVRX$X$X$X$X$5ZX$X$5ZW/W/5ZW/W/X$X$W/W/X$X$W/W/X$X$W/W/X$5WX$5X5XW/W/W/X$X$X$5XX$X$5XX$X$X$W/5XX$5X5Y5Z5ZW/6#W/X$X$X$6#X$X$W/W/W'W'X$5ZW'W'5ZX$W/W/W/5ZW/5ZW/X$5Z6#X$X$W/X$W/W/X$X$5Z6#X$X$6#X$6#X$X$X$X$X$X$6#X$X$X$6#W/W/W/W'W/5ZW'W'5Z6#W'W'W/6#W/6$6$6%6&W'6&6'6(6)X$X$6)X$6)W'W'W'6)W'6*W'6*W'X$W'X$X$W'6*W'W'6*W'W'6*W'W'6*W'W'W'WV6*WVWV6*W/WVWVW/6*W:W:W'6*W'X$6*W'X$W'W'W'6*6+X$6+X$X$6+6,X$X$X$X$6,X$X$X$X$W'X$X$6+6,W'W'6,6-X$6-X$X$W'W'6-W'W'6-X$X$6-W'X$X$W'W'6-6.W'W'X$X$X$X$X$W'X$X$W'6,X$X$X$6,X$X$6,6-X$6-6.6/6/W'W'W'6/60W'W'60X$W'W'60X$W'6161X$62W'W'62W'W'X$X$W'W'61W'W'W'6162W'W'W'62W'W'6263W'W'VRVR6364VRW'64W'WX64WXWP64WXWPWPWX6465WP65WPWPWP65WP66WPWXWPWXWPWX65WPWP65WPWW6666WW67WWWPWPWP67WP67WWWW67WWWWWWWP67686969WWWWWWWXX.WXX.WXWXWX6868WPWPWPWP68WPWPWPWP68WPWPWP68WWWW68WWWW68V&69V&UC69UC6:6:V&V&V&UC6:V?V?6:6;V?V?6;6<V?V?UC6<V?V?6<6=V?V?6=6>V?V?UCUC6>6?UCV&6?V&6?V&6@6ATYTYV&V&TYTY6@TYV&6@TYTY6@TYTYTYV&V&U26@V&V&6@6AV&V&U26AV&V&6AU2TYTY6A6BTYTY6BTY6B6CTQTQ6CTYTQ6DTQ6DTQTQTYTOTYTOTOUUTOUUTOUUTOUUUUUUUU6ATOTOTO6ATOUUTOUUY@6@Y@6AYDYDY7Y7S>S>6@S>S=S=S=6@S=S>6@S=S=6@S=S=S3S36@S3S=S3S=S=S=S3S=S3Y;Y,Y,Y,W0W06=6>W0W06>W06>W0WIWI6>6?W+W+Y;Y;Y;6?Y;Y;6?Y;6?W0WI6@W+W+W&W&6?W+W&W&6?W+W&W&W+W+W&W&W&W+W&6>6>W+6?W+W&W&6?W+W&W+W+W+W&W96>W9W9W9W2W2W9W9W2W96<W9W9W9W&W&W&W9W&W+W9W+6:6;W96<W+W+6<6=VS6=VSVSW+W+VSVSW+W+VSW+6;W9W1W16;W9W9W96;W9W1W96;6<W2W2W9VS6<VS6<VSVSVSY;Y;W+6<W+VYW+6<W+6<VYVYY;Y;6<W+Y;Y;6<VYVY6<VYVY6<Y;VYVYX&X&VYX&VYX&VYX&VY6:VYX&6:X&X&X&VYVYVY6:VY6:VYVY6:X&X&X&6:X&VYX&VY6:VY6;X&X&6;X&X&X&6;6<VY6<VYVYX&X&6<X&6<6=VYVYVYVYWC6=6=X&VY6>X&X&6>X&VWVWX&X&VWVWX&X&VW6<X&6=VWVW6=VWX&6=X&X&6=VWVWVW6=6>W:6?WVWV6?W:W/W/W:6?6?6@W:6AW/W/6AW/6A6BW:W:6BW:6CW:6CW<6D6EW:6EW:W:W:W:W:6EW:W<W<W<W:6DW:W:6D6EW:6FW:W:W:W<6EW:W<W<6EW<W<W<W:W:W:6EW<W<6EW<W<W<6EW<W:W<W:W<W<W?W<W<W<6CW<W<W<W<6C6D6DW?W<W?W<6DW<W<W<W<6D6E6EW?W?W?W<W<W<6EW<W<6EW?W<6EW<W?V#TOV#V#TOTO6DTOTPUQ6DUQUQUQ6DUQTOTO6DTO6DTOUJUJTO6DUJ6EUJ6EUJUJ6ETO6FTOUNUQUNUNTOTOUJ6E6ETOUJUJTOTOUJUJTOTO6D6EUJ6EUJUJ6ETOUJUJ6ETO6FUUW9VSW9VSS<WTS<WTVY6DVYVY6DX&VYVYWCWTWTWTW.WHW.W.W.W.W.6BW.6BW.W.W.WH6BWH6B6CW.W.6C6DW.W.WH6DW.W.W<W<X&6DX&6DX&X&W?W?W?6DW?6DW?W=W=W=W?W?W=W=6CW=W=6CW=W=W=W=W?W=W=W=W=W?W,W,W?W?W,W,W?W?W,W,W,6?W,6?W,6@W,W?6@W?W,6@W,W,6@W?W?W?W,W?W,W?WXWXWXX06>X0X0X0WXWX6>6?WXWX6?W4WXWXW4W4WXWXW4WXWX6=6>X#WXWXX#X#TATATA6=UN6=UNUN6=UNUNUN6=6>TDTDT.6>UH6?UHUH6?UHUDUHUDV6SDT%6>T%X06>6?W$X-X-6?6@W$6@W$X-X-X-6@W$6@6A6BW$X-X-W$6BW$6BW$W$6BX-6CX-W$W$W$6CWXWXWX6CWX6CWX6DWXWXWDWXWX6CWXWX6CWXWXWX6C6DW4W4TG6DTG6ETGTLTGTLS7S7S@S@T#T#SC6CT#T#6CT#SCT#SCT#6BT#SCSCSC6BSCSC6BT#6CT#TGTGTG6CS1SPS16C6C6DS1S16DSP6ESP6ET'SPSPSPSPSP6ESPSP6ET'T'SNT'6E6ESN6FSN6FSN6GSNSNSN6GSNS6S6S66GS6S66GSMS6S66G6H6HSR6ISR6ISJSJSJSJSJSR6I6ISJ6J6KSJSJSJ6KSJSZSZSZWAWAWA6JWA6J6K6L6LWA6M6NWAWA6NWYWAWY6NWYWYWYWYW7WYW7W7W76LW(6MW(U(U(T0U(T06LT0T0SM6LSM6MS:S:S:6MS:SMSMSMS:S:6LSMS:S:SMSMSRSRSR6K6KSJSJSJSR6KSRSRSRSLSLSLSR6JSRSLSRSLSR6JSR6JSRSL6JS;6KS;6KSLSLSLS;SLS;S;SL6JSLS;S;6JS;SA6J6KSASASASZSA6KSZSZ6KSZSA6KSASAV)TT6KTTV-V-V-6KT@V-T@6KV-V-V-6K6K6LT@T@6LUET@T@6LSR6M6NSS6NSSSS6N6OSS6PSS6PSSSSS9S96PS9SUS9S9S9S9S9S96OS96O6PSUS9S9S96P6PSUSUSUSUS9SUSU6O6PT4T4UA6PTJTJT>TJ6PTJTTTT6PV3TJV3TJV3SSSS6O6PS96PS9S9SUSU6PSUSH6PSHSHT26PT2T26PT36QT3T36QT36R6RT>6S6TT36TT3T3T>T>6T6UT36UT3T>6UTJT>6VT>6VT>T>V3V36VV36V6W6XT3T36X6YV3T3T3T36Y6YV36ZV3T>6ZT3T36ZT>7#T>T37#V3V3SFSHSFSHSHSHSV6Z6ZSHSVSVSHSHSH6Z6ZSVSVSVX>6ZXFXF6ZXFXFXFT6T66Z7#T87#T8T8T8T6T8T8T86ZT87#T6T6T67#7#T8T8T8T3T3T37#T3T37#T3T37#T1T17#T3T17$T3T37$T3T1T3T17$T3T3T3T1T3T37#7$7$7%URURUR7%URUR7%V37&7'7'UR7(URT37(T3URT3URT37(T3UR7(UR7(URT3URT3T37(T37(T1T1T17(UR7)URV37)URURV3V37)V3UR7)URURURURT1URSH7(SH7)XFXFXD7)7)XF7*7+7+7,XDXDXFXFXD7,XFXF7,XFXFXF7,XFXD7,XDXD7,7-T8T8T2T2T7T7T2T2T7T7T2T2T7T7T2T2T7T7T2T2T7T77(YWYWYWY9Y97(Y9Y9Y9YW7(Y9Y97(Y9YWY9YWY9X1X1X1X)7&7'X)X)X1X1X)X)7&7'X)X)7'X)X)X)X1X17'7(X1X1X17(Y6Y6YB7(7(YB7)YBY6Y6Y67)Y67)YBYB7)YBYBYBY6Y67)YBY6Y6YBYBYBYBY6Y6YBYB7'YB7'7(Y6Y6Y67(Y6Y67(Y6Y6Y6Y)Y.Y)Y)Y)Y)Y)7'Y)7'Y)Y.Y)Y.Y)Y.Y)Y.Y.Y.YJ7%YWYW7%YWYWYWYJYJYWYJY5Y57$Y.Y.7$Y.Y.Y5YWY5Y5Y.Y.7#Z'Y.7#7$Z'7$Z'Y.7%7%YNZ%Z%YXYXYNYNYNYX7$YXYN7$YNYNYX7$YXYX7$YI7%YIYX7%YXYI7%7&YZYZYPYP7&YPYP7&7'X1YP7'YPYI7'7(YIYI7(7)YIYI7)YPYPYPX17)X1X1YPYPX1X1YPYPYP7(7(X1X1X1YPX17(X1YPX1X1X1X1YIYIYIYIX1YIYIYI7%YI7&YI7&YIX1YIYIYIX1YI7%X1X1YIYIX17%X1YIX1YIX1X1WRX1X1X1X17#X1X17#X)X1X)X)X)WJW@W@W@WJWJ6Y6ZW@W@W6W@VBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUC6RTOUY6S6STOTOTOVDVDVD6SVDVD6STOVDVDTOTOULULTO6RTO6RTOTOULULTOULTO6Q6RUL6RULTOTOULULTOTOULULTO6Q6Q6RTOTOV@6RTZTZV@V@TZTZUPUP6Q6RUPUP6RUPUPUPUUUPY0Y06QY0YK6QYKYK6QY)Y0Y)Y0Y0Y06QY0Y06QYKY0Y0YKYKY0Y06P6Q6QYKYKYK6Q6RYKYK6R6SYKYKY0Y06SY0YK6SYKYKY0Y0YKY06RY0YKY0Y0Y0YKYKYK6QYKYK6Q6RYKYKY0Y06RY0YK6RYK6SYKY0YKY0Y06RY06SY)Y)Y0Y0Y)6RY0Y0Y)Y)Y)6RY)6RY0Y0Y06R6SY06S6TY0Y0Y)Y)Y0Y0Y)Y0Y0Y0Y)Y)Y0Y06QY)Y0Y)Y)Y)6QY)6QY0Y0Y0Y)Y)6QY0Y)Y)6QY)Y06QY06RY)Y)6RY)Y)Y)Y)6RY)Y.Y)Y)Y.Y)Y.6QY)Y)6Q6RY)Y)6RY)Y.Y.Y)6RY.Y.Y)Y.Y)6QY)Y)Y)Y)Y)Y.Y)Y)Y.6PY)6PY.Y.Y.Y.6PY.6PY.6QY.Y)Y.Y)Y)Y)6PY.Y.6PY.Y.Y.Y.Y)Y.Y.Y0Y)Y0Y0Y)Y)6NY)Y06N6OY)Y)Y)Y)Y.Y)Y.Y)6NY)Y)6NY.Y)Y.Y)6N6NY.6OY.Y)Y)Y)6O6OY.Y.Y.Y)Y)Y)6O6OY.Y.Y.Y.Y.6OY)6O6PY.Y.Y0Y0Y0Y)Y0Y)6OY)Y06OY06PY0Y06P6Q6Q6RY)Y)6RY)Y)Y)Y)Y)6R6S6SY.Y)6TY.Y.6TY.Y)6TY)6UY.Y.6UY.Y)6UY)6V6VY)Y06WY)Y)6WY)6WY)6X6Y6YY)Y0Y0Y)6YY)Y.6Y6ZY.Y.YK6ZYKYKY0Y06ZY0Y06ZYKYKY0YCY0Y0YCYC6YYCY0Y0Y06YY0Y0YKYK6X6YYKYK6Y6ZYK7#7#7$Y07%7%7&YKYK7&7'YKYKYCYC7'7(YCYC7(YKYCYCYC7(YCY.Y.Y.YC7'YCY.Y.Y.7'Y.YK7'YKYKY.Y.7'Y.YK7'YK7(Y.7(Y.7)YK7)YKYKYK7)YKYKYK7)YKYK7)Y.YKYK7)Y.7*7+7+7,YKYKYKYK7,7-7-7.YKYKYKZ)YKYKZ)Z)7-Z)YK7-YKZ)Z)Z)Z)7-Z)YKYKYK7,Z)7-Z)Z)Z)Z)7-Z)7-YKYK7-YKYKYKZ)Z)YKYK7,YKYKYKYKYOYKYKYOYO7+YOYKYKYO7+YKYKYOYOYOYKYOYOY.Y.Y.7)7)Y.YKYKYK7)YKY.YKYKYK7)7)Y.Y.Y.YKYK7)YKYKY.YKY.7(Y.Y.Y.Y.Z'7(Z'7(Z'Y.Z'Y.7(Y.Y.Y.7(Y.7)Y.Z'Y.Y.7(Z'7)Z'7)Z'Z'Z'Z'Z'7)Z'7)Z'Y.Y.Y.YMYMYMY.Y.Y.7(Y.Y.YM7(Y.7(Y.Z'Y.Y.Y.7(Y.Y.Y.7(7(Z'7)7*7*Z'7+Z'YKYKYK7+YKYKYKY.YKYK7*Y.YK7*7+Y.7+Y.7,Y.YK7,YKY.7,Y.Y.Y.YKY.Y.Y.7+Y.7,Y.7,Y.YKYKYKYKYK7,YK7,YKY.7,Y.YK7-7-Y.YK7.Y.Y.7.7/Y.Y.Y.7/YK7/Z)Z)Z)7/Z)70Y.Y.7071Y.Y.Z)Z)70Z)Z)Z)Y.70Z)Z)Y.70Z)Z)70Y.Z)Z)Y.Y.Z)Z)7/70Z)Z)Z)Z)Y.Y.Z)Z)7/Z)Y.Y.Z)Z)Y.Y.Z)7.Y.Y.7.Z)7.Z$Z)7/Z)7/Z)70Z)Z)70Z$Z$Z$70Z$70Z#Z#Z#70Z#71Z#71YOZ)Z)Z)Z)71Z)YOZ)7172Z)Z)72Z)Z)YO72YOZ)Z)Z)YOZ)Z)71YO71YOYOYOYOZ)YO71Z)YO71YOZ)Z)YOYOZ)Z)7071Y.7172Z$Y.72Z$Z$7273Z$Z$Y.73Y.7474Z$Z$Z$7475Y.Z$75Z$Z$Z$YOYA75YA75YAYOYOYA75YOYO7576YO77YO77YO78YAYAZ(78YO7879YA79YAYOYOYAYAYO79YO79YOYO79YAYO7:YOYO7:7;7;YAYO7<YOYOYO7<7<YAYAYAYMYMZ$Z$YMYMZ$YMYMZ'YMYMZ'Z'79Z'Z'Z'797:Z'Z'7:7;7;7<YMYM7<YMYMYM7<Z'7=Z'7=Z'YM7>Z'Z'YM7>YMYMYM7>YM7>Y/Y/Y/7>Y/Y/YMYMZ$Z$Z$Z$Z$7=7=Y27>Y27>7?Y2Y2Z$Z$7?Z$Z$7?7@Y2YMYMZ$YMY/Y/7?Y/Z$Y/Z$Z$7>Y/Z$Z$Y/Y/7>Y/Z$7>Z$Y/Z$Y/Z$Z$Z$Z$Z$7=Z$7=Z$Y2Y/Y/Z$Y27<Y/Y2Y/Y/Y/Y27<Y27<Y2Y27<7=Y2Y27=7>Y2Y27>Y/Y2Y27>Y2Y2Y2Y/Y/7>Y/Y/Y/7>Y/Y/Y/Y/7>Y/7>7?Y2Z$Z$7?Z$YAYA7?YA7?7@YAYAZ$7@YAYAYAY27@Y27@Y2YAYAYAYAZ(7@7@Y27A7BZ(Z(Z(7BZ(Z(YR7BZ(Z(YRZ(Z(Z(Z(7A7AZ(YRZ(Y/Y/Y/7AY/Y/Y/Y27@7AY2Y2Y27AY2Y27A7BY2Y2Y/Y/Y/7BY/7BY?Y?Y/7BY/7CY?Y?7C7DY?Y?7DY?Y/Y/Y2Y27C7DY2Y2Y2Y27D7EY27EY-Y-Y2Y27EY2Y2Y2Y27EY1Y1Y-Y-Y1Y17DY1Y27DY2Y1YGYGZ'Z'Z'7CZ'YGYG7CY?Y?YGYGY?Y?Y?Y?Y?7BY?Y?7B7C7CY?Y4Y47CY4Y1Y4Y?Y?Y4Y4Y?Y?Y4Y?Y47AY4Y?Y?Y?Y4Y?Y4Y?Y4Y?Y4Y?7?Y?7?Y?Y4Y?7?Y?Y17@Y17@Y1Y17@7AY?Y1Y?Y?Y1Y17@Y1Y1Y1Y?Y?Y1Y1YIYI7?7@YIYIY?Y?Y?7?Y?Y?7?YIY?Y?YIYI7?YI7?YI7@YIYIYIY?Y?YIYI7?7@YIYIY?YIY?YI7?YIYIYIYI7?Z&Y+Y+Y+VX7>VUVU7>7?VUVUVRX+VRX+VRVR7>7?7?X+X+X+X*W6X*W6W6W6W67>W67>X*X*7>X*X*X*7>7?WXWXW)W)WXW)7>7?WXWX7?X/WXWXX/X/WX7?UCTYUC7?UCUCUCTYUC7>TYTYTZTZTOTOTZTZTOTOTZTZU3U37;7<U3U3TOU37<U37<7=TOTO7=TZU3U3TZTZU3U37<7=U3U3TZTZU3U3TZTZ7<7=TZTZV@V@TZ7<TZ7=7=V@7>V@7>7?V@V@TZTZTZ7?TZTZ7?7@TZTZ7@7ATZTZ7A7BTZTZ7B7C7CV@7DV@7DV@V@V@TZTZUUUUTOU4TOU9U4U4U9U9TOU9TOU9U47@U9U9U4U37@U37@U3U9U3TOTOTO7@TOU37@U37@U87AU8U7U7TOU7U3UUU3UUU3UUU3UUUUUUU>7>U>7>U>U>V@7>V@7?V@7?V@7@TZTZTZ7@7@V@7AV@TZ7ATZ7BTZV@TZV@7AV@TZV@TZV@TZV@V@7@V@7AUUUU7A7B7BUU7CUUV@V@V@UU7BUUUUUUV@UUUUUUYD7AYDY@7AYDY@Y@YDYD7AY@YD7AY@Y@Y@YD7AYDY@7AY@YDYDYDYDYKYD7@YDYDYKYKYDYKY@YDYDYDYKYKY*Y*YKYKYK7=YKYKYDYDYKYD7<YK7<YKYKYKYDYKYDYKYKYKYDYDYKYKYDYDYKYKYDYKYKYK7879YKYK79YKYOYOYK79YK79YK7:YKYKYHYKYOYO79YO79YOYKYOYOYOYO79YO79YOYOYOYO79YQ79YOYQYOYQYQ797:7:YOYOYO7:YRZ(Z(YRYR7:YR7:YRZ(YRYRYRZ(7:YRYRZ(7:Z(YRZ(Z(Z(YLZ(7979YLZ(Z(YR79YRY-YYYYYY79YUYUYYYUYY7879YU79Y1Y-7:7:Y1Y-Y-Y1Y1Y-Y-Y1Y1Y-Y1YV7879Y179Y1YVYVY1Y1YVYVY1Y1Y17878YVYVYVY1Y1787979YVYVYVY1Y179YVYVY1YVYV78YVYVYVY;Y;78Y;Y,Y;Y,Y,Y,Y,Y,77Y,77Y,Y,Y,77Y,Y;Y;Y;Y;X&Y;76X&X&76X&X&X&W#W#X&76W#7677X&77W#X&W#X&77X&X&7778X&X&X2W#X2X2W#W#W#77W#W#7778VWWVVW78VWVWVW78VW78VWVW78WVWVW/WVWV78WVWVWVVWWVWVWV77787879VWVWWVWVVWWVWSVRWSWS77VRWS78VRVR78X$78X$X$X$VRVR7879VR79X$X$79X$X$X$VRVR797:VR7:X$X$7:7;X$X$VRX$X$X$W'7:W'X$7:7;X$X$7;X$X$X$W'X$X$X$W'X$X$X$VRVRW'W'VRVR78VRW'VRW'W'VRVRVR7777X$78X$X$78W/W/78X$W/W/X$X$W/W/X$X$X$77X$77X$X$X$X$W/W/X$X$7677X$X$77W/X$X$W/W/X$X$X$76X$X$7677X$X$777878X$W/W/X$78X$79X$X$W/W/W'W'X$78W'W'78X$W/W/7879W/W/W/7979X$X$X$79X$X$X$W/79W/W/79X$W/W/X$X$W/X$X$X$78X$X$X$X$78X$X$W'W'W/W/W/77W/W/W'W'76W'W'W'7677W/W/W/W/W/777778W/W/78W/W/W/W/W/W'W'W/W/W'77W/W'77W'W'77787979W'W'W'X$X$79X$W/W/W/W'X$X$W'W'77W'W'W'7778X$X$W'78797:X$X$X$W'W'X$X$X$78X$X$X$WV78WV79W/W/79WVW/W/797:W'X$W'X$X$79X$W'W'W'W'79W'W'X$W'X$78X$X$78X$X$X$X$W'X$X$X$X$7778X$X$78W'78W'W'W'W'W'X$X$W'W'77W'W'W'777878W'X$X$W'W'W'78W'W'787979W'X$7:7:7;X$X$X$X$W'X$X$X$X$7:X$X$X$7:X$7:7;W'X$X$X$7;7;7<W'W'7<7=W'W'7=W'W'W'X$X$X$7=X$7=7>W'7>X$W'W'X$X$W'X$X$X$W'W'X$X$7<7=7=W'W'W'W'7=W'W'X$7=7>W'X$7>X$7?7?W'7@W'VRVRW'W'VRVRW'W'VRVRW'7>W'7>W'W'7>VRW'W'VRW'W'W'WXWXWX7=WXWX7=WXWXWXWX7=WXWXWXWP7<WPWPWPWPWP7<WPWXWPWPWPWX7;WPWPWPWPWW7;WW7;WWWWWPWPWP7;7;7<WWWWWPWPWP7<WP7<7=WW7=WWWWWWWPWPWP7=WP7=WWWW7=7>WWWW7>WWWWWWWX7>WPWPWXWP7>7?WP7?WP7@WPWPWP7@WPWP7@7AWW7AWWWWUCV&UCV&UC7@UC7AUCUCUC7AUC7AUCUCUCV&V&V&UCUC7@7AUCUC7AV?UCUCV?V?UCUCV?V?UC7?V?V?UCUC7?V?UCUCV?V?UCUCV?V?UC7=V?V?7=UCV?V?UC7=V&V&7=UCV&V&7=7>V&V&V?V&V?7>V?V&7>U2V&V&7>7?V&V&7?TYV&V&TYTY7>TYTYTYV&7>U2U27>7?U2U27?U2U2U2U27?U2U27?7@U2U2TYTYTQTQTYTYTQTQTYTY7>TYTQ7>TQTQTQ7>TQTQ7>TYTQ7?TYTY7?TYTQTYTQTQUUUU7>UUTOUU7>UU7>YDY@YDY@YDY@7>7>S>S=7?S=7?7@S>S>S>7@S=S3S37@7A7AS3S=S=W0W07A7BW07B7CWIW0W07CW0WIW0WIWIY;Y;W+7B7BW+W+W+Y;Y;W+7BY;Y;7BY;W0W0WIW0W0W0WIWIW+W+7@7AW+W+7A7B7BW&W&W+W+W+7BW+7BW+W+W+W&W&W&W+W&W9W&W9W9W9W9W2W97?W9W9W+W+7?W+7?W+W9W+VS7?VSVSW+W+7?W+VSW+VSW+W9W9W17>W1W17>W9W1W1W1W9W9W9W2W2W9W9W9W2W9W9W97;W9VSW9VS7:7;W+W+W+VYW+VYW+7:W+VY7:W+W+W+Y;Y;Y;7:VY7:VYVYY;Y;VYY;X&79X&X&797:X&X&VYVY7:7;7;X&VYVY7;X&7<X&X&X&VYX&VY7;7<X&X&X&VYX&X&X&7;7<X&X&X&7<X&X&VYVYX&X&VY7;7;X&7<X&VYX&VYVY7;7<VYVYVYVYWCVYX&X&7;X&X&X&VYX&VY7:VY7;VWVWX&VWX&7:X&X&VWVW7:VWX&X&X&7:7:VWVWVWW:7:W:W:7:WVW:WVW:7:W:W:7:7;W:W:7;7<W:7=7=W/W:7>W/W/7>W/7>W/W:7?W/W/7?W/W:7?W:W:7?W/W:W/W:W:W/W:W/W:W/W/W:W<W:W<W:7<W:W:W<W<7<W<7<W<W:W:W:7<W<W<7<7=W:W:W<W<W:W:W<W<7<W<7<W<W:W<W:W:7<W<7<W<W<W<W:W<W:W<7;W<W<W<W:W<W:W:7:W?W?W?W<W<W<7:7:W?W?W?7:W?W<W<W<W?W<W<W<W<W<79W<79W?W?W<W?W?W?W<W<W<78W<W<W<W?W<77W<W<77TOV#78TP7879UQ79UQ7:7;7;TOUJ7<UJ7<UJUJTOTO7<TO7<TOUJ7=UJTOUJ7=TOTO7=TO7=TOTOTOTOTOUJ7=7=7>UJ7?UJ7?UJUJ7?TO7@TOUJ7@UJUJ7@7AUJUJTOUUTO7ATO7AUUUU7AX&VYVYX&X&7A7BW.W.W.7BW.WHW.W.7AWH7BWHWHWH7B7CWHWH7C7DWHWH7DW.WHW.W.W.WH7CWHW.W<W<7CW<X&7CX&W<W?7CW?7DW?W=W?W=7CW=W?W?7CWXW=7DW,W?W,7DW?W?7DW?7DW?W?W?W?W?7DW?W,7DW,7E7EW?W?W?WX7E7F7GWXWXWX7GWX7GW4W47GW4W4W4WXWXWXX#WXX#X#X#7EUNUNUNUQUQ7E7FUQ7F7GUNTKTKTDTDTKTKTDTKT.T.UHUHUHUHUH7DUHUH7DUHSD7DSDT%X0X0X07D7DW$W$W$7DX-W$W$X-X-7DX-7DX-X-X-X-X-7DX-X-X-X-7DX-X-7D7EX-W$X-W$X-X-W$X-W$7CW$W$X-X-7CX-W$7CW$7DW$X-W$X-WXW4WXW4WXWXWX7BWX7BWX7CWX7CWXWXWDWD7CWDWX7CW4W47CW4W4W47CTL7DTL7DTLTGTLT#7DSC7E7ET#SC7FSC7FSCSCSC7FSCSCT#T#7FT#SC7FSCSCTG7FTG7GS1SPS1S1S1SPS1S1SPSP7E7FSPSP7FSPS1SPS1SPSP7ESPSPSPSPSP7E7E7FT'T'T'SN7FSNT'7FT'7GT'7GT'7HT'7H7ISNT'SNSNSN7HSNT'SNS6S67H7IS6S6SMSMS6S6S67H7HS6SR7IS6SRS6SR7HSRSRSRSR7H7ISJ7ISJSRSRSRSJSRSJSR7HSRSR7HSRSRSRSJSJSZSZWAWAWAWYWAWAWA7FWY7FWYWY7FWYWYWYWAWA7FWAWY7FWYWYWAWA7FWYWAWAWYWYWAWYWAWYW(W(W(WBW(WBWBWB7BU(T0U(SMSMSM7BSM7BSMSMS:S:7B7CS:7C7DSMSRSRSR7DSJSJ7DSJSR7DSRSJ7DSLSLSLSLSL7DSLSLSLSRSLSRS;SRS;SRS;SRS;SJ7ASJ7BSLSLSLS;S;S;S;SASLSLSASASLSLSASASA7>SASA7>SZSA7?SASASASZV)7>V)V)V-V-V-7>7>UET@7?V-V-T@T@V-V-7>T@V-7>7?T@UEUE7?UESSSRSS7?SS7?SSSS7?SRSSSSSS7?SSSSSASASSSSSASA7>SASS7>SSSSSSS9SSSSS9S9SUS9S9S9S9SUSUSU7;SU7;7<SUSUS9S97<7=S97=SUSUUAUAUA7=UAUA7=UAUATJTJTJT>TJT>TJ7;7<7=V3SGSSSGSGSSSS7<SSS9S9S97<SUSU7<SUSHSGSHSHT27;T27<7<T37=T37=T3T2T3T3T3T37=T37=T3T3T3T>T37=T37=T3T3T>T>7=T>T3T>T3T37<7=T3T3T>T>7=T>T37=T3T>T>7=T>7>T>TJT>T>T>T>T>7=7=V37>V37>V37?7@V3V37@V3T3T3T>T3T3T37?V37?V3V3V3T3T37?V3T3T3T3V37>V3V3V3T>T>7>7?T>T>7?T>T37?T3T3T3T37?V3SHSHSVSVSHSHSHSVSHSH7=7>SH7>SHSVX>X>7>7?X>X>7?7@T87@T8T8T6T67@7A7A7BT8T8T8T6T8T6T8T6T8T8T6T67@7AT87AT8T8T3T3T:T:T3T3T:T:T3T1T1T1T1T3T1T17=7>T1T1T3T37>T3T17>T1T1URURT3URV3V3URV3T37<T3URURV3URURURV3UR7;V3V37;V3UR7;URURV3V3URV3T3URT3UR79UR7:UR7:7;URUR7;URT37<T3T3T3URT3URT3T37:T1T1T1T3T37:T37:URT3URT3UR7:URV3V3UR7:7:V3UR7;7;7<URURSVSVSH7<SHSVSVSV7;XDXDXDXFXF7;XF7;7<XDXD7<XF7=XF7=XFXDXDXFXDXDXDXFXFXD7<XFXF7<7=XFXF7=XF7=7>XDXD7>7?T8T8T1T1T8T1YWY9YWYWYWY9YWYWY9Y9YWYWY9Y9YWY9X1X1X)X)X1X1X)X)X)X1X)X)X1X1X)X)X1X)X)X)X1X1X)X)X1X1X)X)X1X1X1X)Y6Y6YBYBY6YBY6YBY6YBYBYBY6Y6YBYBY6Y6YBYBY6YBYBYBY6YBYBYBY6YBY6Y6YBYBY6Y6YBYBY6Y6Y6YBY6Y6YBYBY6Y6Y)Y.Y)Y.Y)Y.Y)Y.YJYJYWYWYJYJYWYWY5Y5Y.Y.Y.Y5Y.Y.Y.Y.Y.Z'Z'Z'Y.Z'Y.Y.Y.Z'Z'Z'Y.Z'Z'Z'Y.Z'YNYNZ%Z%YNYXYNYXYXYXYNYNYXYIYXYXYIYIYXYIYXYXYXYIYXYXYXYIYPYPYZYZYPYPYZYPYZYZYZYPYPYPX1X1YPYPYPX1YPYIYPYPYIYPYIYIYPYPYIYIYIYPYIYIYPYPYIYIYPYPYPYIYPYPX1X1YPX1X1X1YPYPX1X1YPX1YPX1YIYIYIX1YIX1YIX1YIYIYIX1YIYIX1X1X1YIX1YIX1X1X1X)X1X)X)X)WJWJW@W@WJWJW@W@UYTOUYUYUYTOUYUYUYTOUYTOVDVDVDTOVDVDTOTOULULTOULTOULTOTOTOULULULTOULULULULULTOULULULTOULULULTOTOULULTOTOV@V@TZV@UPUPUPUUUPUPUUUUUPUPUUUUY0Y0YKY0Y0Y0YKY0Y0Y)Y0Y0Y0Y0YKYKY0YKYKYKY0Y0YKYKY0Y0YKYKY0YKYKYKY0Y0YKY0Y0Y0Y0YKY0Y0YKYKY0Y0YKY0Y0Y0YKY0Y0Y0YKY0YKYKYKY0Y0Y0YKYKY0Y0YKYKY0Y0YKY0Y0Y0YKYKY0Y0YKY0YKY0YKY0Y)Y)Y0Y)Y0Y)Y0Y)Y)Y)Y0Y0Y)Y)Y0Y0Y)Y0Y0Y0Y)Y)Y0Y0Y)Y0Y0Y0Y)Y)Y0Y0Y)Y)Y0Y0Y)Y)Y0Y)Y0Y)Y0Y)Y0Y)Y0Y0Y)Y)Y0Y0Y0Y)Y0Y0Y0Y)Y0Y)Y0Y)Y0Y0Y)Y)Y0Y)Y)Y)Y.Y.Y.Y)Y.Y.Y)Y)Y.Y.Y)Y)Y.Y.Y)Y)Y.Y.Y.Y.Y)Y)Y)Y.Y)Y.Y)Y)Y.Y.Y)Y)Y)Y.Y.Y.Y)Y)Y)Y.Y)Y)Y)Y.Y.Y.Y)Y)Y.Y.Y)Y)Y.Y.Y)Y)Y0Y0Y0Y)Y)Y)Y0Y)Y0Y0Y)Y.Y)Y)Y)Y)Y)Y.Y)Y.Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.Y.Y.Y)Y.Y.Y.Y.Y)Y)Y)Y)Y)Y.Y.Y)Y.Y.Y.Y0Y0Y0Y)Y0Y)Y0Y0Y0Y0Y0Y)Y0Y0Y0Y)Y0Y)Y)Y)Y0Y)Y0Y)Y0Y)Y)Y)Y)Y)Y0Y)Y)Y)Y)Y.Y)Y.Y.Y.Y)Y.Y)Y)Y)Y.Y)Y.Y.Y.Y.Y)Y)Y.Y.Y.Y)Y.Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.Y)Y.Y)Y.Y0Y)Y0Y)Y)Y)Y0Y0Y)Y)Y0Y)Y0Y)Y0Y)Y)Y)Y0Y0Y)Y)Y0Y0Y)Y)Y)Y0Y)Y)Y)Y.Y)Y.Y.Y.Y)Y.Y.Y.Y0Y0YKYKYKY0YKYKY0Y0YKYKY0Y0Y0YCY0YCY0Y0Y0Y0Y0YKY0Y0YKYKY0Y0YKYCY0YCYCYCYKYCYKYCYCYCY0Y0YCYCY0YCY0YCY0YCYCYCYKYKYCYCYKYKYCYCYKYKYCYCYKYCYCYCYCYKYCYCYKYCYCYCYKYKYCY.YCY.YCY.YCY.Y.Y.YKYKYKY.YKYKYKY.YKY.YKY.YKY.Y.Y.YKYKY.YKY.Y.Y.Y.Y.YKY.YKYKYKY.YKYKYKY.Y.YKYKY.Y.YKYKY.Y.YKY.YKY.YKYKY.YKYKYKYKY.YKYKY.Y.YKY.YKYKYKZ)YKYKZ)Z)Z)Z)Z)YKZ)Z)Z)YKYKZ)Z)Z)YKZ)YKZ)Z)Z)Z)YKYKZ)YKZ)YKYKZ)Z)Z)Z)Z)YKZ)Z)Z)YKZ)YKYKYKZ)Z)YKYKYKYOYKYOYOYKYOYOY.Y.YKY.Y.Y.YKYKYKY.YKYKYKY.YKY.YKY.Y.Y.YKYKY.Y.Y.Y.YKY.Y.Z'Z'Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Y.Y.Z'Y.Y.Y.Z'Y.Z'Z'Z'Z'Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Y.Y.Z'Y.Z'YMY.YMYMY.Z'Z'Z'Y.Z'Z'Z'Y.Y.Y.Z'Y.Y.Y.Z'Z'Z'YMYMZ'Z'YMYMY.Y.Y.Z'Y.Z'Z'Z'YKYKYKY.YKY.Y.Y.YKY.Y.Y.YKY.YKY.YKY.YKY.YKY.YKY.YKYKYKY.YKY.Y.Y.YKY.YKY.YKY.YKY.YKY.YKY.YKYKYKY.YKY.Y.Y.YKY.YKY.Y.Y.YKY.YKY.YKY.Y.Y.Z)Y.Y.Y.Y.Z)Y.Y.Z)Z)Y.Y.Z)Y.YKYKZ)Z)Z)Z)Y.Y.Z)Y.Z)Z)Y.Y.Z)Z)Y.Z)Z)Z)Y.Z)Z)Z)Y.Y.Y.Z)Y.Y.Y.Z)Y.Y.Z)Y.Y.Y.Y.Z)Y.Y.Z)Z)Z)Z)Y3Y3Y.Y.Z)Z)Y.Y.Z)Z)Z)Z$Z)Z$Z$Z$Z)Z$Z)Z$Z)Z$Z)Z$Z)Z$Z)Z$Z$Z$Z#Z$Z#Z$Z)Z#Z#Z#Z#Z#Z)Z#Z)Z#Z)Z)Z)Z)YOZ)YOZ)YOYOYOZ)YOYOZ)Z)YOYOZ)Z)YOYOZ)YOZ)YOZ)Z)Z)YOZ)YOYOYOYOZ)YOYOZ)Z)Z)YOZ)Z)YOYOZ)YOYOYOY.Y.Y.Z$Y.Y.Y.Z$Y.Y.Z$Z$Y.Y.Y.Z$Y.Y.Z$Z$Y.Z$Y.Y.Y.Z$Z$Z$Y.Z$Z$Z$Y.Y.Y.Z$Y.Y.Z$Z$Y.Z$Z$Z$YOYAYAYAYOYAYOYOYAYAYAYOYAYAYOYOYAYAYOYAYOYAYOYAYOYOYOYAYOYAYOYOYAYAZ(Z(YOYAYAYAYOYAYAYAYAYAYOYOYOYAYOYOYOYAYOYOYAYAYOYOYOYAYOYOYOYOYAYAYOYOYAYOYAYAYOYAYAYAYOYOYOYAYAYAYOYOYOYAZ'Z'YMZ'Z'Z'YMYMZ'Z'YMYMZ'Z'YMYMZ'Z'YMZ'YMZ'YMYMZ'Z'YMYMZ'Z'YMYMYMYMYMZ'Z'Z'YMZ'YMZ'YMYMZ'Z'YMZ'Z'Z'YMYMYMYMY/YMYMYMYMY/Y/YMY/Y/Z$Z$Y2Y2Z$Z$Z$Y2Z$Y2Y2Y2Z$Z$Y2Y2Z$Z$Y2Y2Z$Z$Y2Y2Z$Y2Z$Y2Z$Y2Y2Y2Z$Y/Z$Y/Z$Y/Z$Z$Z$Y/Z$Z$Z$Y/Y/Y/Z$Z$Z$Y2Z$Z$Z$Y2Y2Y/Y2Y2Y2Y/Y2Y2Y2Y/Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y/Y2Y/Y/Y2Y2Y/Y/Y2Y/Y/Y/Y/Y2Y/Y/Y2Y2Y/Y2Y2Y2Y/Y2Y2Y2Z$Z$Z$YAYAYAZ$Z$Z$Z$YAYAZ$Z$YAYAZ$YAZ$YAYAY2Y2Y2Y2Y2YAY2YAZ(Z(Z(Y2Z(Z(Z(Z(Y2Y2Y2Y2Y2Z(Y2Z(Z(Z(YRYRZ(YRYRYRYRYRZ(Z(Z(YRYRY/Y/Y2Y2Y/Y/Y/Y2Y/Y/Y2Y2Y2Y/Y2Y2Y/Y/Y2Y2Y/Y2Y2Y2Y/Y/Y/Y?Y/Y/Y?Y?Y/Y?Y/Y?Y/Y?Y/Y/Y?Y?Y2Y2Y?Y2Y2Y2Y2Y?Y2Y2Y/Y/Y2Y2Y/Y2Y2Y2Y2Y2Y2Y-Y2Y2Y-Y-Y2Y-Y-Y-Y2Y2Y-Y-Y2Y2Y2Y1Y-Y1Y-Y-Y2Y2Y2Y1YGYGZ'YGYGYGY?Y?Y?Y?Y1Y1Y?Y?Y1Y1Y?Y1Y1Y1Y?Y?Y4Y4Y4Y4Y1Y4Y4Y?Y4Y4Y4Y?Y?Y?Y4Y?Y4Y?Y?Y?Y1Y1Y1Y?Y1Y?Y1Y?Y1Y1Y?Y?Y?Y1Y?Y?Y1Y1Y?Y1Y1Y1Y?YIY?Y?YIYIY?YIYIYIY?Y?YIYIY?YIYIYIY?YIY?YIY?YIY?Y?Y?YIYIYIY?YIYIYIY?Y?YIYIY?YIYIYIZ&Z&VXVXVXVUVXVXVUVUVXVUVUVUVRVRX+X+VRX+X+X+VRVRVRX+W6W6W6X*W6W6X*X*W6W6X*X*W)W)WXWXW)W)WXW)WXX/WXWXX/X/WXWXX/X/WXWXWXX/WXX/UCTYUCTYUCTYTYTYTZTZU3U3TZTZU3U3TOU3TOU3TOU3TOTOU3U3TOTOTZTZU3U3TZTZU3U3TZTZU3U3TZTZTZV@TZTZV@V@TZTZTZV@TZV@V@V@TZV@TZV@TZV@TZV@TZTZTZV@TZTZV@V@TZTZTZUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZV@TZV@TZV@TZV@TZV@TZV@U4U4U9U9U4U3U4U3U4U3U9U3TOTOU3U3TOTOU3U3TOTOTOU8TOU8U8U8UUUUU>U>UUUUU>U>V@UUV@UUV@UUV@UUV@UUV@V@V@V@V@UUTZV@V@V@TZV@TZV@TZTZTZV@TZTZTZV@TZV@V@V@TZV@TZV@V@UUV@UUUUUUV@UUUUUUV@V@UUUUV@UUV@UUV@UUV@UUV@UUV@V@UUUUYDYDYDY@YDYDY@Y@YDYDYDY@YDYDYDY@Y@YDYDYDY@YDYDYDYKYKYDYDYKYKYKYDYDYKYDYKYKYKYDYKYKYKYDYDYKYKYDYDYKYKYDYDYOYOYKYOYKYKYKYHYHYHYKYHYOYOYKYOYKYOYKYOYOYOYOYQYOYQYOYQYOYOYQYQYOYOYQYQYQYQYOYOYQYQYOYOYQYQYQYOYRYRZ(Z(YRYRZ(YRZ(YRZ(Z(YRYRZ(YRYRYRZ(YRZ(YLZ(YLYLYLZ(YLYRY-Y-Y-YYYYYUYUYYYUYYYUYYYUYUYUY1Y1Y-Y1Y1Y1Y-Y1Y-Y1Y-Y-YVYVY1Y1YVYVYVY1Y1Y1YVYVY1YVYVYVY1Y1YVYVY1Y1YVYVY1YVYVYVY1YVYVYVY1Y1Y1YVY1YVYVYVY;Y;Y,Y;Y,Y;Y,Y,Y,Y,Y,Y;Y,Y,Y,Y;Y;Y;X&X&Y;X&X&X&W#W#X&W#W#W#W#X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&WVWVVWVWVWWVVWWVVWWVVWWVWVWVWVW/WVWVVWVWVWWVVWVWWVWVVWWVVWWVVWVWWVWVVWWVVRVRWSVRVRVRWSWSVRVRVRX$VRX$X$X$VRVRVRX$VRX$X$X$VRVRVRX$VRX$VRVRX$VRX$X$VRVRX$X$VRVRX$X$VRVRX$X$VRVRX$X$W'W'X$X$W'X$X$X$W'W'X$X$W'W'X$X$VRVRW'VRVRVRX$X$VRX$VRX$VRX$X$X$X$X$W/W/X$X$W/X$X$X$X$W/W/W/X$W/X$X$W/W/X$X$W/W/X$W/W/W/X$W/X$X$X$X$W/W/X$X$W/W/X$X$W/W/X$X$W/W/X$X$W/W/W/W/X$W/W/W/X$W/W'W'X$X$W'X$X$X$W/W/W/X$W/X$X$X$W/X$X$X$W/W/W/X$W/X$X$X$X$X$W/W/X$X$W/W/X$X$W/X$X$X$W'W'W/W/W/W'W/W/W'W'W/X$W/W/X$X$W/W/W'W'W/W'X$X$W/W/X$W/W/W/W/X$W/W/W/W/W'W'W/W'W/W'W'W'W'W/W'W/W'W/W/W/W/W'W/W'W'W'X$X$X$W/W'X$W'X$W'W'X$X$W'W'X$W'W'X$W'X$W'X$W'W'X$X$W'X$X$W'X$X$WVWVWVW/W/W/WVWVW/W/WVWVW/W/W:W:W/W/W:W:X$W'X$W'W'W'X$X$X$W'X$X$W'X$X$X$X$W'W'W'W'X$W'X$X$X$X$W'X$X$W'W'X$W'X$X$X$W'X$X$W'W'X$W'X$W'X$X$W'W'X$X$W'W'X$X$W'W'X$X$W'W'X$W'X$W'X$X$W'W'W'X$W'X$X$X$X$X$X$W'X$X$W'W'X$X$W'W'X$X$W'W'X$W'X$W'X$X$X$W'X$X$W'W'X$X$W'X$W'W'X$W'X$W'W'W'X$X$X$W'X$X$W'W'X$W'W'W'X$X$W'W'X$X$X$W'X$X$W'W'X$W'X$W'X$X$W'W'X$W'W'W'X$W'W'W'W'W'X$X$X$X$W'W'W'W'X$X$X$X$W'W'W'VRW'W'VRVRW'W'VRVRW'VRWXWXWPWPWPWPWPWXWXWPWPWPWXWXWPWPWXWPWXWXWXWXWPWPWPWPWWWWWPWPWWWWWPWWWPWWWPWPWPWWWPWWWWWWWPWPWWWPWPWPWWWWWPWWWWWWWPWPWWWWWPWWWPWWWPWPWPWWWPWPWWWWWPWWWWWWWPWWWWWWWXWXWPWPWXWPWPWPWPWXWPWPWPWWWPWWWPWPWPWWWPWPWWWPWPWPWPWWWPWPWWWWWPWWWWWWV&V&UCV&UCV&UCV&UCV&V&V&UCV&UCUCUCUCV?V?UCUCV?V?UCUCV?V?UCUCV?V?UCUCV?V?UCUCUCV?UCUCV?V?UCUCV&V&UCUCV&V&UCUCV&V&UCV&V&V&V?V&V?V&V?V?U2U2U2V&U2U2V&V&U2U2V&TYV&V&V&V&V&TYV&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2TYTYTQTYTYTQTQTQTQTYTQTQTYTYTQTYTYTYTQTYTQTYTQTQUUUUTOUUTOTOUUUUY@YDY@YDY@YDY@YDS=S>S=S>S>S>S=S=S=S>S>S>S=S>S=S=S>S>S=S=S=S3S=S=S3S3S=S3S3S3S=S3W0W0WIWIW0WIWIWIW0W0W0WIWIW0WIWIWIW0WIW0Y;Y;W+W+Y;Y;Y;W+W+Y;W+W+W+Y;W+W+W+W+W&W&W+W+W&W+W+W+W+W&W+W+W&W+W&W&W&W+W+W+W&W+W&W+W&W+W9W+W9W9W9W+W9W+W9W+W9W9VSW+VSW+W+W+VSW+W9W9W1W9W1W1W1W9W9W9W9VSY;Y;W+Y;Y;Y;W+W+W+W+W+VYY;Y;W+W+Y;VYY;VYY;Y;VYY;X&VYX&X&VYVYX&X&VYVYX&X&VYVYVYX&VYX&X&X&X&X&VYX&VYVYVYX&X&X&VYX&VYVYVYX&VYVYX&X&VYX&VYVYX&X&VYX&X&VYVYVYVYX&VYVYVYX&VYX&VYX&VYVYX&X&X&VYX&X&VYVYVYX&VYVYVYX&VYX&VYX&VYVYX&VWX&X&VWVWX&VWX&X&X&VWX&VWVWVWW:WVW:W:WVWVW:WVWVWVW:WVWVWVWVW:WVWVW:W:W:W/W:W:W/W/W:W/W:W/W:W:W/W/W:W/W:W/W:W:W/W/W:W/W:W/W:W:W:W/W:W:W/W/W:W/W:W/W:W:W/W/W:W/W:W<W:W:W:W<W:W<W:W<W:W:W:W<W<W<W<W<W:W:W<W<W:W<W<W<W:W<W:W<W:W<W:W:W:W<W:W:W:W<W:W<W<W<W<W<W<W?W<W<W?W?W<W<W<W?W<W?W<W?W<W?W?W?W<W<W<W?W<W<W<W?W<W?W<W?TOTOV#TOTOTOV#TOTPUQTPUQTPTPTPUQUQUQTPUQTPUQTPTPUQUQTPUQUJTOUJUJUJTOUJTOTOTOUJTOTOTOUJTOUJTOUJUJUJTOTOTOTOTOUJUJTOTOUJTOUJTOTOTOUJTOUJTOTOTOUJUJTOTOUJTOUJTOUJUJTOTOUJTOTOTOUJTOUJTOUJUJUJTOUJUJTOTOUJUJTOTOUJTOTOUUTOUUTOUUUUUUX&X&VYVYX&X&VYVYX&X&VYX&W.W.W.WHW.W.W.WHW.WHWHWHW.WHW.W.WHWHW.WHWHWHW.W.WHWHW.W.WHWHWHW.WHW.WHW.X&W<X&X&X&W<W<W<W?W?W?W=W?W=W=W=W?W=W?W=WXWXW=W=W=WXW=W=W,W?W,W,W,W?W,W?W,W,W,W?W?W?W,W,W,W,W,W?W,W?W,W?W,W,W?W,WXX0X0X0WXWXX0X0WXX0X0X0WXW4W4W4WXWXWXW4WXW4W4W4TAUNUNUNUNUQUNUNUQUQUNUQUQUQUNUNUQUNUQUNUHUHUDUDUHUHUDUDSDT%SDT%X0X0X0W$X0X0X0W$X-X-W$W$W$X-W$X-W$X-W$X-X-X-X-W$X-X-X-W$X-X-W$W$X-W$W$W$W$X-W$W$W$X-W$W$X-X-W$X-W$X-W$X-WXWXWXWDWXWDWDWDWXWDWXWDWXWXWXWDWDWDWXWDWXWXWXW4WXW4W4W4TGTLTLTLTLTLTGTLTGTLTGTGT#T#T#SCT#T#SCSCT#T#SCSCT#T#SCT#T#T#SCT#T#T#SCSCT#T#SCSCSCT#SCSCTGTLTGTLTGTLTGTLSPSPS1S1SPSPS1S1SPSPS1S1SPT'SPSPSPT'SPT'SPSPSPT'SPSPT'T'T'T'T'SNT'T'T'SNT'SNT'SNT'SNT'SNT'SNT'T'T'SNSNSNT'SNT'SNT'SNT'SNS6SMSMSMSMS6SMSMS6SRS6SRS6S6SRSRSRS6SRSRS6SRS6SRSRSJSJSJSRSRSRSJSRSJSRSRSRSJSRSRSJSJSRSRWAWAWYWYWAWAWYWYWAWYWYWYWAWAWYWAWYWAWYWYWYWAWYWYT0U(T0U(SMS:SMS:SMS:SMSMS:S:S:SMS:S:SMSMS:S:S:SMS:SMSMSMSRSJSRSJSRSJSRSJSRSJSRSJSRSRSRSLSLSLSRSLSJSJSJSLSJSLSJSLSASZSASASZSZSASZSZSZSASAV)TTV)TTV-V-V-T@T@V-T@T@T@UET@T@V-T@T@T@V-T@T@T@V-V-T@T@UEUET@T@SRSRSSSRSSSRSSSSSRSRSRSSSRSSSSSSSASASSSASASASSSAS9S9S9SUSUS9SUSUS9S9S9SUS9S9S9SUS9S9SUSUS9S9SUSUUAUAUAT4UAUAT4UATTTTTTV3TTTTV3V3TTV3V3V3SGSSSGSSS9SUS9S9SGSUSGSUT2T2T3T3T2T3T2T2T2T2T3T3T3T3T2T3T2T3T2T3T3T3T>T>T3T>T3T3T>T>T3T>T3T>T3T3T3T>T3T>T3T>T3T3T>T>T3T>T>T>T3T>T>T>T3T>TJTJT>TJT>TJT>T>T>V3T>T>V3V3T>V3T>V3T>V3T>V3T>V3T>V3T>T3V3V3T3T3V3V3T3V3T3T3V3V3T3V3V3V3T3T3T3V3T3V3V3V3T>T>T3T3T>T>T3T3T>T>T3T>T>T>T3T>T3V3V3V3SHSHSHSVSHSVSVSVSHSVSHSVX>XFXFXFXFX>XFXFX>X>XFXFX>XFXFXFT6T6T8T6T8T6T8T8T6T6T8T6T6T6T8T6T6T6T8T6T6T6T8T8T6T6T6T8T6T6T8T8T1T3T1T1T3T3T1T3T1T3T1T1T1T3T1T1URURT3URURV3URURV3URURURV3V3URV3T3URT3URT3T3T3URT3T3T3URT3URURURT3URT3T3T3URT3T3T3T3T1T1T1T3T1T1T3URT3URT3URURURURV3URV3V3V3URURURV3URURURV3URURV3V3URURSHSVSVSVXFXFXDXDXFXFXDXFXDXFXDXFXFXFXDXFXFXFXDXFXDXFXDXDXFXFXDXFXDXFXDXDXFXFXDXDXFXFXDXFXFXFXDXFXDXFXDXDXFXFXDXDT8T1T8T8T1T1T8T8", T = ["Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek", "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota", "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun", "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua", "America/Ciudad_Juarez", "America/Costa_Rica", "America/Creston", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza", "America/Glace_Bay", "America/Goose_Bay", "America/Grand_Turk", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz", "America/Lima", "America/Los_Angeles", "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Menominee", "America/Merida", "America/Mexico_City", "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo", "America/Montserrat", "America/Nassau", "America/New_York", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah", "America/North_Dakota/New_Salem", "America/Nuuk", "America/Ojinaga", "America/Panama", "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas", "America/Rankin_Inlet", "America/Recife", "America/Regina", "America/Rio_Branco", "America/Santarem", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka", "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie", "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Rothera", "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok", "Arctic/Longyearbyen", "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Chita", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena", "Atlantic/Stanley", "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lord_Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney", "Etc/GMT", "Etc/GMT+1", "Etc/GMT+10", "Etc/GMT+11", "Etc/GMT+12", "Etc/GMT+2", "Etc/GMT+3", "Etc/GMT+4", "Etc/GMT+5", "Etc/GMT+6", "Etc/GMT+7", "Etc/GMT+8", "Etc/GMT+9", "Etc/GMT-1", "Etc/GMT-10", "Etc/GMT-11", "Etc/GMT-12", "Etc/GMT-2", "Etc/GMT-3", "Etc/GMT-4", "Etc/GMT-5", "Etc/GMT-6", "Etc/GMT-7", "Etc/GMT-8", "Etc/GMT-9", "Etc/UTC", "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey", "Europe/Kaliningrad", "Europe/Kirov", "Europe/Kyiv", "Europe/Lisbon", "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San_Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Vaduz", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb", "Europe/Zurich", "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion", "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham", "Pacific/Chuuk", "Pacific/Easter", "Pacific/Efate", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Kanton", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby", "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis"];
    if (W = +W, !(-90 <= (Y = +Y) && Y <= 90 && -180 <= W && W <= 180)) throw new RangeError("invalid coordinates");
    if (90 <= Y) return "Etc/GMT";
    for (var V = -1, S = 48 * (180 + W) / 360.00000000000006, U = 24 * (90 - Y) / 180.00000000000003, Z = 0 | S, $ = 0 | U, K = 96 * $ + 2 * Z, K = 56 * X.charCodeAt(K) + X.charCodeAt(K + 1) - 1995; K + T.length < 3136; ) K = 56 * X.charCodeAt(K = 8 * (V = V + K + 1) + 4 * ($ = 0 | (U = 2 * (U - $) % 2)) + 2 * (Z = 0 | (S = 2 * (S - Z) % 2)) + 2304) + X.charCodeAt(K + 1) - 1995;
    return T[K + T.length - 3136];
  }
  module2.exports = tzlookup;
})(tz);
var tzExports = tz.exports;
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(GeoTz, "__esModule", { value: true });
GeoTz.geoTz = geoTz;
const tz_lookup_1 = __importDefault(tzExports);
function geoTz(lat, lon) {
  return (0, tz_lookup_1.default)(lat, lon);
}
var VersionTask$1 = {};
Object.defineProperty(VersionTask$1, "__esModule", { value: true });
VersionTask$1.VersionTask = void 0;
const ExifToolTask_1$2 = ExifToolTask$1;
const _VersionTask = class _VersionTask extends ExifToolTask_1$2.ExifToolTask {
  constructor(options) {
    super(["-ver"], options);
  }
  parse(input) {
    const value = input.trim();
    if (_VersionTask.versionRegex.test(value)) {
      return value;
    } else {
      throw new Error(`Unexpected version ${value}`);
    }
  }
};
__publicField(_VersionTask, "versionRegex", /^\d{1,3}\.\d{1,3}(?:\.\d{1,3})?$/);
let VersionTask = _VersionTask;
VersionTask$1.VersionTask = VersionTask;
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DefaultExifToolOptions = exports2.ConsoleLogger = void 0;
  exports2.defaultAdjustTimeZoneIfDaylightSavings = defaultAdjustTimeZoneIfDaylightSavings;
  const bc2 = __importStar2(BatchCluster);
  const node_util_1 = require$$0;
  const Boolean_1 = _Boolean;
  const CapturedAtTagNames_1 = CapturedAtTagNames;
  const DefaultExiftoolArgs_1 = DefaultExiftoolArgs;
  const DefaultMaxProcs_1 = DefaultMaxProcs;
  const ExiftoolPath_1 = ExiftoolPath;
  const GeoTz_1 = GeoTz;
  const IsWin32_12 = IsWin32;
  const VersionTask_1 = VersionTask$1;
  const _debuglog = (0, node_util_1.debuglog)("exiftool-vendored");
  function noop() {
  }
  exports2.ConsoleLogger = {
    trace: noop,
    debug: _debuglog,
    info: _debuglog,
    warn: console.warn,
    error: console.error
  };
  function logger() {
    return (0, node_util_1.debuglog)("exiftool-vendored").enabled ? exports2.ConsoleLogger : bc2.NoLogger;
  }
  exports2.DefaultExifToolOptions = Object.freeze({
    ...new bc2.BatchClusterOptions(),
    maxProcs: DefaultMaxProcs_1.DefaultMaxProcs,
    maxTasksPerProcess: 500,
    spawnTimeoutMillis: 3e4,
    streamFlushMillis: 10,
    // see https://github.com/photostructure/exiftool-vendored.js/issues/34 :
    taskTimeoutMillis: 2e4,
    onIdleIntervalMillis: 2e3,
    taskRetries: 1,
    exiftoolPath: ExiftoolPath_1.exiftoolPath,
    exiftoolArgs: DefaultExiftoolArgs_1.DefaultExiftoolArgs,
    exiftoolEnv: {},
    checkPerl: !(0, IsWin32_12.isWin32)(),
    pass: "{ready}",
    fail: "{ready}",
    exitCommand: "-stay_open\nFalse\n",
    versionCommand: new VersionTask_1.VersionTask().command,
    healthCheckIntervalMillis: 3e4,
    healthCheckCommand: "-ver\n-execute\n",
    backfillTimezones: true,
    defaultVideosToUTC: true,
    geoTz: GeoTz_1.geoTz,
    geolocation: false,
    ignoreZeroZeroLatLon: true,
    ignoreMinorErrors: true,
    imageHashType: false,
    includeImageDataMD5: void 0,
    inferTimezoneFromDatestamps: false,
    // to retain prior behavior
    inferTimezoneFromDatestampTags: [...CapturedAtTagNames_1.CapturedAtTagNames],
    inferTimezoneFromTimeStamp: false,
    // to retain prior behavior
    logger,
    numericTags: [
      "*Duration*",
      "GPSAltitude",
      "Orientation"
      // NOT Rotation! Rotation can be encoded as degrees rotated clockwise, or a
      // EXIF-Orientation string (!!). If we ask ExifTool for numeric rotations of HEICs,
      // we get "3" (when it means "Rotate 90 CW"):
      // $ exiftool -j -Rotation -Orientation IMG_6947.HEIC
      // [{
      //   "Rotation": "Rotate 90 CW",
      //   "Orientation": "Rotate 90 CW"
      // }]
      // $ exiftool -j -Rotation# -Orientation# IMG_6947.HEIC
      // [{
      //   "Rotation": 3,   // < WTH is this? 3 means 180º (!?)
      //   "Orientation": 6 // < expected
      // }]
    ],
    useMWG: false,
    struct: 1,
    readArgs: ["-fast"],
    writeArgs: [],
    adjustTimeZoneIfDaylightSavings: defaultAdjustTimeZoneIfDaylightSavings,
    preferTimezoneInferenceFromGps: false
    // to retain prior behavior
  });
  function defaultAdjustTimeZoneIfDaylightSavings(t) {
    return true === (0, Boolean_1.toBoolean)(t.DaylightSavings) && // Daggum Nikon likes "FS-Nikon", "Nikon", "NIKON", and "NIKON CORPORATION"
    /\bnikon\b/i.test(String(t.Make)) ? 60 : void 0;
  }
})(DefaultExifToolOptions);
var DeleteAllTagsArgs = {};
Object.defineProperty(DeleteAllTagsArgs, "__esModule", { value: true });
DeleteAllTagsArgs.DeleteAllTagsArgs = void 0;
DeleteAllTagsArgs.DeleteAllTagsArgs = ["-all="];
var ExifToolOptions = {};
Object.defineProperty(ExifToolOptions, "__esModule", { value: true });
ExifToolOptions.handleDeprecatedOptions = handleDeprecatedOptions;
function handleDeprecatedOptions(options) {
  if (options.imageHashType == null && options.includeImageDataMD5 != null) {
    options.imageHashType = options.includeImageDataMD5 ? "MD5" : false;
  }
  return options;
}
var _Object = {};
Object.defineProperty(_Object, "__esModule", { value: true });
_Object.isObject = isObject;
_Object.keys = keys;
_Object.isFunction = isFunction;
_Object.fromEntries = fromEntries;
_Object.omit = omit;
_Object.keysOf = keysOf;
function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}
function keys(o) {
  return o == null ? [] : Object.keys(o).filter((ea) => ({}).propertyIsEnumerable.call(o, ea));
}
function isFunction(obj) {
  return typeof obj === "function";
}
function fromEntries(arr, obj) {
  if (arr == null || arr.length === 0)
    return obj;
  for (const ea of arr.filter((ea2) => ea2 != null)) {
    if (ea != null && Array.isArray(ea)) {
      const [k, v] = ea;
      if (k != null && v !== void 0) {
        if (typeof obj !== "object")
          obj = {};
        obj[k] = v;
      }
    }
  }
  return obj;
}
function omit(t, ...keysToOmit) {
  if (t == null)
    return {};
  const result = { ...t };
  for (const ea of keysToOmit) {
    delete result[ea];
  }
  return result;
}
function keysOf(t) {
  return Object.keys(t);
}
var Pick = {};
Object.defineProperty(Pick, "__esModule", { value: true });
Pick.pick = pick$1;
function pick$1(obj, ...keyNames) {
  if (obj == null)
    return obj;
  const result = {};
  for (const key of keyNames) {
    const v = obj[key];
    if (v !== void 0)
      result[key] = obj[key];
  }
  return result;
}
var ReadRawTask$1 = {};
var ErrorsAndWarnings = {};
Object.defineProperty(ErrorsAndWarnings, "__esModule", { value: true });
ErrorsAndWarnings.errorsAndWarnings = errorsAndWarnings;
const Array_1$1 = _Array;
const String_1$1 = _String;
function errorsAndWarnings(task, t) {
  return {
    errors: (0, Array_1$1.uniq)((0, String_1$1.compactBlanks)([t == null ? void 0 : t.Error, ...task.errors])),
    warnings: (0, Array_1$1.uniq)((0, String_1$1.compactBlanks)([t == null ? void 0 : t.Warning, ...task.warnings]))
  };
}
var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$1 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$1 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
  }
  __setModuleDefault$1(result, mod);
  return result;
};
Object.defineProperty(ReadRawTask$1, "__esModule", { value: true });
ReadRawTask$1.ReadRawTask = void 0;
const batch_cluster_1 = BatchCluster;
const _path$1 = __importStar$1(require$$1$1);
const ErrorsAndWarnings_1 = ErrorsAndWarnings;
const ExifToolTask_1$1 = ExifToolTask$1;
const FilenameCharsetArgs_1$1 = FilenameCharsetArgs;
class ReadRawTask extends ExifToolTask_1$1.ExifToolTask {
  constructor(sourceFile, args, options) {
    super(args, options);
    __publicField(this, "sourceFile");
    __publicField(this, "args");
    this.sourceFile = sourceFile;
    this.args = args;
  }
  static for(filename, exiftoolArgs = [], options) {
    const args = [...FilenameCharsetArgs_1$1.Utf8FilenameCharsetArgs, ...exiftoolArgs];
    if (!args.includes("-json"))
      args.push("-json");
    const sourceFile = _path$1.resolve(filename);
    args.push(sourceFile);
    return new ReadRawTask(sourceFile, args, options);
  }
  toString() {
    return "ReadRawTask" + this.sourceFile + ")";
  }
  parse(data, err) {
    try {
      const tags = JSON.parse(data)[0];
      const { errors, warnings } = (0, ErrorsAndWarnings_1.errorsAndWarnings)(this, tags);
      tags.errors = errors;
      tags.warnings = warnings;
      return tags;
    } catch (jsonError) {
      (0, batch_cluster_1.logger)().error("ExifTool.ReadRawTask(): Invalid JSON", { data });
      throw err ?? jsonError;
    }
  }
}
ReadRawTask$1.ReadRawTask = ReadRawTask;
var ReadTask = {};
var BinaryField$1 = {};
Object.defineProperty(BinaryField$1, "__esModule", { value: true });
BinaryField$1.BinaryField = void 0;
const Number_1$2 = _Number;
const BinaryFieldRE = (
  // 1000000000 bytes is 1 GB. The largest binary field I've seen is ~5 MB (7
  // chars): 10 chars is absurdly large, and is just to avoid the
  // `js/polynomial-redos` eslint rule.
  /Binary(?: data)? (\d{1,10}) bytes/i
);
class BinaryField {
  constructor(bytes, rawValue) {
    __publicField(this, "bytes");
    __publicField(this, "rawValue");
    this.bytes = bytes;
    this.rawValue = rawValue;
  }
  toJSON() {
    return {
      _ctor: "BinaryField",
      bytes: this.bytes,
      rawValue: this.rawValue
    };
  }
  static fromJSON(json) {
    return new BinaryField(json.bytes, json.rawValue);
  }
  static fromRawValue(rawValue) {
    const m = rawValue.match(BinaryFieldRE);
    if (m != null) {
      const bytes = (0, Number_1$2.toInt)(m[1]);
      if (bytes != null) {
        return new BinaryField(bytes, rawValue);
      }
    }
    return;
  }
}
BinaryField$1.BinaryField = BinaryField;
var ExifDate = {};
var luxon = {};
Object.defineProperty(luxon, "__esModule", { value: true });
class LuxonError extends Error {
}
class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}
class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}
class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}
class ConflictingSpecificationError extends LuxonError {
}
class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}
class InvalidArgumentError extends LuxonError {
}
class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}
const n = "numeric", s = "short", l = "long";
const DATE_SHORT = {
  year: n,
  month: n,
  day: n
};
const DATE_MED = {
  year: n,
  month: s,
  day: n
};
const DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s
};
const DATE_FULL = {
  year: n,
  month: l,
  day: n
};
const DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};
const TIME_SIMPLE = {
  hour: n,
  minute: n
};
const TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n
};
const TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
const TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
const TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hourCycle: "h23"
};
const TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23"
};
const TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s
};
const TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l
};
const DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n
};
const DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n
};
const DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n
};
const DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n
};
const DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n
};
const DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s
};
const DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
const DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l
};
const DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
class Zone {
  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type() {
    throw new ZoneIsAbstractError();
  }
  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name() {
    throw new ZoneIsAbstractError();
  }
  /**
   * The IANA name of this zone.
   * Defaults to `name` if not overwritten by a subclass.
   * @abstract
   * @type {string}
   */
  get ianaName() {
    return this.name;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal() {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, opts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  get isValid() {
    throw new ZoneIsAbstractError();
  }
}
let singleton$1 = null;
class SystemZone extends Zone {
  /**
   * Get a singleton instance of the local zone
   * @return {SystemZone}
   */
  static get instance() {
    if (singleton$1 === null) {
      singleton$1 = new SystemZone();
    }
    return singleton$1;
  }
  /** @override **/
  get type() {
    return "system";
  }
  /** @override **/
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName(ts, {
    format,
    locale
  }) {
    return parseZoneInfo(ts, format, locale);
  }
  /** @override **/
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  /** @override **/
  equals(otherZone) {
    return otherZone.type === "system";
  }
  /** @override **/
  get isValid() {
    return true;
  }
}
let dtfCache = {};
function makeDTF(zone) {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      era: "short"
    });
  }
  return dtfCache[zone];
}
const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  era: 3,
  hour: 4,
  minute: 5,
  second: 6
};
function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted), [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
}
function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  const filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const {
      type,
      value
    } = formatted[i];
    const pos = typeToPos[type];
    if (type === "era") {
      filled[pos] = value;
    } else if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}
let ianaZoneCache = {};
class IANAZone extends Zone {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }
    return ianaZoneCache[name];
  }
  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }
  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @deprecated For backward compatibility, this forwards to isValidZone, better use `isValidZone()` directly instead.
   * @return {boolean}
   */
  static isValidSpecifier(s2) {
    return this.isValidZone(s2);
  }
  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone) {
    if (!zone) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: zone
      }).format();
      return true;
    } catch (e) {
      return false;
    }
  }
  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = IANAZone.isValidZone(name);
  }
  /**
   * The type of zone. `iana` for all instances of `IANAZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "iana";
  }
  /**
   * The name of this zone (i.e. the IANA zone name).
   * @override
   * @type {string}
   */
  get name() {
    return this.zoneName;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns false for all IANA zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
    return false;
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, {
    format,
    locale
  }) {
    return parseZoneInfo(ts, format, locale, this.name);
  }
  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @override
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    const date = new Date(ts);
    if (isNaN(date)) return NaN;
    const dtf = makeDTF(this.name);
    let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
    if (adOrBc === "BC") {
      year = -Math.abs(year) + 1;
    }
    const adjustedHour = hour === 24 ? 0 : hour;
    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour: adjustedHour,
      minute,
      second,
      millisecond: 0
    });
    let asTS = +date;
    const over = asTS % 1e3;
    asTS -= over >= 0 ? over : 1e3 + over;
    return (asUTC - asTS) / (60 * 1e3);
  }
  /**
   * Return whether this Zone is equal to another zone
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  /**
   * Return whether this Zone is valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return this.valid;
  }
}
let intlLFCache = {};
function getCachedLF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlLFCache[key];
  if (!dtf) {
    dtf = new Intl.ListFormat(locString, opts);
    intlLFCache[key] = dtf;
  }
  return dtf;
}
let intlDTCache = {};
function getCachedDTF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
}
let intlNumCache = {};
function getCachedINF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache[key];
  if (!inf) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache[key] = inf;
  }
  return inf;
}
let intlRelCache = {};
function getCachedRTF(locString, opts = {}) {
  const {
    base,
    ...cacheKeyOpts
  } = opts;
  const key = JSON.stringify([locString, cacheKeyOpts]);
  let inf = intlRelCache[key];
  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache[key] = inf;
  }
  return inf;
}
let sysLocaleCache = null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else {
    sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
    return sysLocaleCache;
  }
}
let weekInfoCache = {};
function getCachedWeekInfo(locString) {
  let data = weekInfoCache[locString];
  if (!data) {
    const locale = new Intl.Locale(locString);
    data = "getWeekInfo" in locale ? locale.getWeekInfo() : locale.weekInfo;
    weekInfoCache[locString] = data;
  }
  return data;
}
function parseLocaleString(localeStr) {
  const xIndex = localeStr.indexOf("-x-");
  if (xIndex !== -1) {
    localeStr = localeStr.substring(0, xIndex);
  }
  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    let selectedStr;
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
      selectedStr = localeStr;
    } catch (e) {
      const smaller = localeStr.substring(0, uIndex);
      options = getCachedDTF(smaller).resolvedOptions();
      selectedStr = smaller;
    }
    const {
      numberingSystem,
      calendar
    } = options;
    return [selectedStr, numberingSystem, calendar];
  }
}
function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (outputCalendar || numberingSystem) {
    if (!localeStr.includes("-u-")) {
      localeStr += "-u";
    }
    if (outputCalendar) {
      localeStr += `-ca-${outputCalendar}`;
    }
    if (numberingSystem) {
      localeStr += `-nu-${numberingSystem}`;
    }
    return localeStr;
  } else {
    return localeStr;
  }
}
function mapMonths(f) {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const dt = DateTime$1.utc(2009, i, 1);
    ms.push(f(dt));
  }
  return ms;
}
function mapWeekdays(f) {
  const ms = [];
  for (let i = 1; i <= 7; i++) {
    const dt = DateTime$1.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}
function listStuff(loc, length, englishFn, intlFn) {
  const mode = loc.listingMode();
  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}
function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn";
  }
}
class PolyNumberFormatter {
  constructor(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;
    const {
      padTo,
      floor,
      ...otherOpts
    } = opts;
    if (!forceSimple || Object.keys(otherOpts).length > 0) {
      const intlOpts = {
        useGrouping: false,
        ...opts
      };
      if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }
  format(i) {
    if (this.inf) {
      const fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
      return padStart(fixed, this.padTo);
    }
  }
}
class PolyDateFormatter {
  constructor(dt, intl, opts) {
    this.opts = opts;
    this.originalZone = void 0;
    let z = void 0;
    if (this.opts.timeZone) {
      this.dt = dt;
    } else if (dt.zone.type === "fixed") {
      const gmtOffset = -1 * (dt.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
        z = offsetZ;
        this.dt = dt;
      } else {
        z = "UTC";
        this.dt = dt.offset === 0 ? dt : dt.setZone("UTC").plus({
          minutes: dt.offset
        });
        this.originalZone = dt.zone;
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else if (dt.zone.type === "iana") {
      this.dt = dt;
      z = dt.zone.name;
    } else {
      z = "UTC";
      this.dt = dt.setZone("UTC").plus({
        minutes: dt.offset
      });
      this.originalZone = dt.zone;
    }
    const intlOpts = {
      ...this.opts
    };
    intlOpts.timeZone = intlOpts.timeZone || z;
    this.dtf = getCachedDTF(intl, intlOpts);
  }
  format() {
    if (this.originalZone) {
      return this.formatToParts().map(({
        value
      }) => value).join("");
    }
    return this.dtf.format(this.dt.toJSDate());
  }
  formatToParts() {
    const parts = this.dtf.formatToParts(this.dt.toJSDate());
    if (this.originalZone) {
      return parts.map((part) => {
        if (part.type === "timeZoneName") {
          const offsetName = this.originalZone.offsetName(this.dt.ts, {
            locale: this.dt.locale,
            format: this.opts.timeZoneName
          });
          return {
            ...part,
            value: offsetName
          };
        } else {
          return part;
        }
      });
    }
    return parts;
  }
  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
}
class PolyRelFormatter {
  constructor(intl, isEnglish, opts) {
    this.opts = {
      style: "long",
      ...opts
    };
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }
  format(count2, unit) {
    if (this.rtf) {
      return this.rtf.format(count2, unit);
    } else {
      return formatRelativeTime(unit, count2, this.opts.numeric, this.opts.style !== "long");
    }
  }
  formatToParts(count2, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count2, unit);
    } else {
      return [];
    }
  }
}
const fallbackWeekSettings = {
  firstDay: 1,
  minimalDays: 4,
  weekend: [6, 7]
};
class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.weekSettings, opts.defaultToEN);
  }
  static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
    const specifiedLocale = locale || Settings.defaultLocale;
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
    return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }
  static resetCache() {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  }
  static fromObject({
    locale,
    numberingSystem,
    outputCalendar,
    weekSettings
  } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
  }
  constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = {
      format: {},
      standalone: {}
    };
    this.monthsCache = {
      format: {},
      standalone: {}
    };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }
  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }
    return this.fastNumbersCached;
  }
  listingMode() {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }
  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, validateWeekSettings(alts.weekSettings) || this.weekSettings, alts.defaultToEN || false);
    }
  }
  redefaultToEN(alts = {}) {
    return this.clone({
      ...alts,
      defaultToEN: true
    });
  }
  redefaultToSystem(alts = {}) {
    return this.clone({
      ...alts,
      defaultToEN: false
    });
  }
  months(length, format = false) {
    return listStuff(this, length, months, () => {
      const intl = format ? {
        month: length,
        day: "numeric"
      } : {
        month: length
      }, formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths((dt) => this.extract(dt, intl, "month"));
      }
      return this.monthsCache[formatStr][length];
    });
  }
  weekdays(length, format = false) {
    return listStuff(this, length, weekdays, () => {
      const intl = format ? {
        weekday: length,
        year: "numeric",
        month: "long",
        day: "numeric"
      } : {
        weekday: length
      }, formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays((dt) => this.extract(dt, intl, "weekday"));
      }
      return this.weekdaysCache[formatStr][length];
    });
  }
  meridiems() {
    return listStuff(this, void 0, () => meridiems, () => {
      if (!this.meridiemCache) {
        const intl = {
          hour: "numeric",
          hourCycle: "h12"
        };
        this.meridiemCache = [DateTime$1.utc(2016, 11, 13, 9), DateTime$1.utc(2016, 11, 13, 19)].map((dt) => this.extract(dt, intl, "dayperiod"));
      }
      return this.meridiemCache;
    });
  }
  eras(length) {
    return listStuff(this, length, eras, () => {
      const intl = {
        era: length
      };
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime$1.utc(-40, 1, 1), DateTime$1.utc(2017, 1, 1)].map((dt) => this.extract(dt, intl, "era"));
      }
      return this.eraCache[length];
    });
  }
  extract(dt, intlOpts, field) {
    const df = this.dtFormatter(dt, intlOpts), results = df.formatToParts(), matching = results.find((m) => m.type.toLowerCase() === field);
    return matching ? matching.value : null;
  }
  numberFormatter(opts = {}) {
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }
  dtFormatter(dt, intlOpts = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }
  relFormatter(opts = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }
  listFormatter(opts = {}) {
    return getCachedLF(this.intl, opts);
  }
  isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
  }
  getWeekSettings() {
    if (this.weekSettings) {
      return this.weekSettings;
    } else if (!hasLocaleWeekInfo()) {
      return fallbackWeekSettings;
    } else {
      return getCachedWeekInfo(this.locale);
    }
  }
  getStartOfWeek() {
    return this.getWeekSettings().firstDay;
  }
  getMinDaysInFirstWeek() {
    return this.getWeekSettings().minimalDays;
  }
  getWeekendDays() {
    return this.getWeekSettings().weekend;
  }
  equals(other) {
    return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
  }
  toString() {
    return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
  }
}
let singleton = null;
class FixedOffsetZone extends Zone {
  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance() {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }
  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(offset2) {
    return offset2 === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset2);
  }
  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  static parseSpecifier(s2) {
    if (s2) {
      const r = s2.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }
    return null;
  }
  constructor(offset2) {
    super();
    this.fixed = offset2;
  }
  /**
   * The type of zone. `fixed` for all instances of `FixedOffsetZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "fixed";
  }
  /**
   * The name of this zone.
   * All fixed zones' names always start with "UTC" (plus optional offset)
   * @override
   * @type {string}
   */
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }
  /**
   * The IANA name of this zone, i.e. `Etc/UTC` or `Etc/GMT+/-nn`
   *
   * @override
   * @type {string}
   */
  get ianaName() {
    if (this.fixed === 0) {
      return "Etc/UTC";
    } else {
      return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
    }
  }
  /**
   * Returns the offset's common name at the specified timestamp.
   *
   * For fixed offset zones this equals to the zone name.
   * @override
   */
  offsetName() {
    return this.name;
  }
  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    return formatOffset(this.fixed, format);
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns true for all fixed offset zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
    return true;
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   *
   * For fixed offset zones, this is constant and does not depend on a timestamp.
   * @override
   * @return {number}
   */
  offset() {
    return this.fixed;
  }
  /**
   * Return whether this Zone is equal to another zone (i.e. also fixed and same offset)
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }
  /**
   * Return whether this Zone is valid:
   * All fixed offset zones are valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return true;
  }
}
class InvalidZone extends Zone {
  constructor(zoneName) {
    super();
    this.zoneName = zoneName;
  }
  /** @override **/
  get type() {
    return "invalid";
  }
  /** @override **/
  get name() {
    return this.zoneName;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName() {
    return null;
  }
  /** @override **/
  formatOffset() {
    return "";
  }
  /** @override **/
  offset() {
    return NaN;
  }
  /** @override **/
  equals() {
    return false;
  }
  /** @override **/
  get isValid() {
    return false;
  }
}
function normalizeZone(input, defaultZone2) {
  if (isUndefined(input) || input === null) {
    return defaultZone2;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone2;
    else if (lowered === "local" || lowered === "system") return SystemZone.instance;
    else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
    else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && "offset" in input && typeof input.offset === "function") {
    return input;
  } else {
    return new InvalidZone(input);
  }
}
const numberingSystems = {
  arab: "[٠-٩]",
  arabext: "[۰-۹]",
  bali: "[᭐-᭙]",
  beng: "[০-৯]",
  deva: "[०-९]",
  fullwide: "[０-９]",
  gujr: "[૦-૯]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[០-៩]",
  knda: "[೦-೯]",
  laoo: "[໐-໙]",
  limb: "[᥆-᥏]",
  mlym: "[൦-൯]",
  mong: "[᠐-᠙]",
  mymr: "[၀-၉]",
  orya: "[୦-୯]",
  tamldec: "[௦-௯]",
  telu: "[౦-౯]",
  thai: "[๐-๙]",
  tibt: "[༠-༩]",
  latn: "\\d"
};
const numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
};
const hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
function parseDigits(str) {
  let value = parseInt(str, 10);
  if (isNaN(value)) {
    value = "";
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (str[i].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i]);
      } else {
        for (const key in numberingSystemsUTF16) {
          const [min, max] = numberingSystemsUTF16[key];
          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }
    return parseInt(value, 10);
  } else {
    return value;
  }
}
let digitRegexCache = {};
function resetDigitRegexCache() {
  digitRegexCache = {};
}
function digitRegex({
  numberingSystem
}, append = "") {
  const ns = numberingSystem || "latn";
  if (!digitRegexCache[ns]) {
    digitRegexCache[ns] = {};
  }
  if (!digitRegexCache[ns][append]) {
    digitRegexCache[ns][append] = new RegExp(`${numberingSystems[ns]}${append}`);
  }
  return digitRegexCache[ns][append];
}
let now = () => Date.now(), defaultZone = "system", defaultLocale = null, defaultNumberingSystem = null, defaultOutputCalendar = null, twoDigitCutoffYear = 60, throwOnInvalid, defaultWeekSettings = null;
class Settings {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return now;
  }
  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n2) {
    now = n2;
  }
  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   * Use the value "system" to reset this value to the system's time zone.
   * @type {string}
   */
  static set defaultZone(zone) {
    defaultZone = zone;
  }
  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone() {
    return normalizeZone(defaultZone, SystemZone.instance);
  }
  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultLocale() {
    return defaultLocale;
  }
  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(locale) {
    defaultLocale = locale;
  }
  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }
  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(numberingSystem) {
    defaultNumberingSystem = numberingSystem;
  }
  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }
  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(outputCalendar) {
    defaultOutputCalendar = outputCalendar;
  }
  /**
   * @typedef {Object} WeekSettings
   * @property {number} firstDay
   * @property {number} minimalDays
   * @property {number[]} weekend
   */
  /**
   * @return {WeekSettings|null}
   */
  static get defaultWeekSettings() {
    return defaultWeekSettings;
  }
  /**
   * Allows overriding the default locale week settings, i.e. the start of the week, the weekend and
   * how many days are required in the first week of a year.
   * Does not affect existing instances.
   *
   * @param {WeekSettings|null} weekSettings
   */
  static set defaultWeekSettings(weekSettings) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }
  /**
   * Get the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   */
  static get twoDigitCutoffYear() {
    return twoDigitCutoffYear;
  }
  /**
   * Set the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   * @example Settings.twoDigitCutoffYear = 0 // all 'yy' are interpreted as 20th century
   * @example Settings.twoDigitCutoffYear = 99 // all 'yy' are interpreted as 21st century
   * @example Settings.twoDigitCutoffYear = 50 // '49' -> 2049; '50' -> 1950
   * @example Settings.twoDigitCutoffYear = 1950 // interpreted as 50
   * @example Settings.twoDigitCutoffYear = 2050 // ALSO interpreted as 50
   */
  static set twoDigitCutoffYear(cutoffYear) {
    twoDigitCutoffYear = cutoffYear % 100;
  }
  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static get throwOnInvalid() {
    return throwOnInvalid;
  }
  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static set throwOnInvalid(t) {
    throwOnInvalid = t;
  }
  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
    DateTime$1.resetCache();
    resetDigitRegexCache();
  }
}
class Invalid {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }
  toMessage() {
    if (this.explanation) {
      return `${this.reason}: ${this.explanation}`;
    } else {
      return this.reason;
    }
  }
}
const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
function unitOutOfRange(unit, value) {
  return new Invalid("unit out of range", `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`);
}
function dayOfWeek(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (year < 100 && year >= 0) {
    d.setUTCFullYear(d.getUTCFullYear() - 1900);
  }
  const js = d.getUTCDay();
  return js === 0 ? 7 : js;
}
function computeOrdinal(year, month, day) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}
function uncomputeOrdinal(year, ordinal) {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex((i) => i < ordinal), day = ordinal - table[month0];
  return {
    month: month0 + 1,
    day
  };
}
function isoWeekdayToLocal(isoWeekday, startOfWeek) {
  return (isoWeekday - startOfWeek + 7) % 7 + 1;
}
function gregorianToWeek(gregObj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const {
    year,
    month,
    day
  } = gregObj, ordinal = computeOrdinal(year, month, day), weekday = isoWeekdayToLocal(dayOfWeek(year, month, day), startOfWeek);
  let weekNumber = Math.floor((ordinal - weekday + 14 - minDaysInFirstWeek) / 7), weekYear;
  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek);
  } else if (weekNumber > weeksInWeekYear(year, minDaysInFirstWeek, startOfWeek)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }
  return {
    weekYear,
    weekNumber,
    weekday,
    ...timeObject(gregObj)
  };
}
function weekToGregorian(weekData, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const {
    weekYear,
    weekNumber,
    weekday
  } = weekData, weekdayOfJan4 = isoWeekdayToLocal(dayOfWeek(weekYear, 1, minDaysInFirstWeek), startOfWeek), yearInDays = daysInYear(weekYear);
  let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 7 + minDaysInFirstWeek, year;
  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }
  const {
    month,
    day
  } = uncomputeOrdinal(year, ordinal);
  return {
    year,
    month,
    day,
    ...timeObject(weekData)
  };
}
function gregorianToOrdinal(gregData) {
  const {
    year,
    month,
    day
  } = gregData;
  const ordinal = computeOrdinal(year, month, day);
  return {
    year,
    ordinal,
    ...timeObject(gregData)
  };
}
function ordinalToGregorian(ordinalData) {
  const {
    year,
    ordinal
  } = ordinalData;
  const {
    month,
    day
  } = uncomputeOrdinal(year, ordinal);
  return {
    year,
    month,
    day,
    ...timeObject(ordinalData)
  };
}
function usesLocalWeekValues(obj, loc) {
  const hasLocaleWeekData = !isUndefined(obj.localWeekday) || !isUndefined(obj.localWeekNumber) || !isUndefined(obj.localWeekYear);
  if (hasLocaleWeekData) {
    const hasIsoWeekData = !isUndefined(obj.weekday) || !isUndefined(obj.weekNumber) || !isUndefined(obj.weekYear);
    if (hasIsoWeekData) {
      throw new ConflictingSpecificationError("Cannot mix locale-based week fields with ISO-based week fields");
    }
    if (!isUndefined(obj.localWeekday)) obj.weekday = obj.localWeekday;
    if (!isUndefined(obj.localWeekNumber)) obj.weekNumber = obj.localWeekNumber;
    if (!isUndefined(obj.localWeekYear)) obj.weekYear = obj.localWeekYear;
    delete obj.localWeekday;
    delete obj.localWeekNumber;
    delete obj.localWeekYear;
    return {
      minDaysInFirstWeek: loc.getMinDaysInFirstWeek(),
      startOfWeek: loc.getStartOfWeek()
    };
  } else {
    return {
      minDaysInFirstWeek: 4,
      startOfWeek: 1
    };
  }
}
function hasInvalidWeekData(obj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const validYear = isInteger(obj.weekYear), validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear, minDaysInFirstWeek, startOfWeek)), validWeekday = integerBetween(obj.weekday, 1, 7);
  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.weekNumber);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else return false;
}
function hasInvalidOrdinalData(obj) {
  const validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else return false;
}
function hasInvalidGregorianData(obj) {
  const validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else return false;
}
function hasInvalidTimeData(obj) {
  const {
    hour,
    minute,
    second,
    millisecond
  } = obj;
  const validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else return false;
}
function isUndefined(o) {
  return typeof o === "undefined";
}
function isNumber(o) {
  return typeof o === "number";
}
function isInteger(o) {
  return typeof o === "number" && o % 1 === 0;
}
function isString(o) {
  return typeof o === "string";
}
function isDate(o) {
  return Object.prototype.toString.call(o) === "[object Date]";
}
function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
}
function hasLocaleWeekInfo() {
  try {
    return typeof Intl !== "undefined" && !!Intl.Locale && ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype);
  } catch (e) {
    return false;
  }
}
function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}
function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return void 0;
  }
  return arr.reduce((best, next) => {
    const pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}
function pick(obj, keys2) {
  return keys2.reduce((a, k) => {
    a[k] = obj[k];
    return a;
  }, {});
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function validateWeekSettings(settings) {
  if (settings == null) {
    return null;
  } else if (typeof settings !== "object") {
    throw new InvalidArgumentError("Week settings must be an object");
  } else {
    if (!integerBetween(settings.firstDay, 1, 7) || !integerBetween(settings.minimalDays, 1, 7) || !Array.isArray(settings.weekend) || settings.weekend.some((v) => !integerBetween(v, 1, 7))) {
      throw new InvalidArgumentError("Invalid week settings");
    }
    return {
      firstDay: settings.firstDay,
      minimalDays: settings.minimalDays,
      weekend: Array.from(settings.weekend)
    };
  }
}
function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
}
function floorMod(x, n2) {
  return x - n2 * Math.floor(x / n2);
}
function padStart(input, n2 = 2) {
  const isNeg = input < 0;
  let padded;
  if (isNeg) {
    padded = "-" + ("" + -input).padStart(n2, "0");
  } else {
    padded = ("" + input).padStart(n2, "0");
  }
  return padded;
}
function parseInteger(string) {
  if (isUndefined(string) || string === null || string === "") {
    return void 0;
  } else {
    return parseInt(string, 10);
  }
}
function parseFloating(string) {
  if (isUndefined(string) || string === null || string === "") {
    return void 0;
  } else {
    return parseFloat(string);
  }
}
function parseMillis(fraction) {
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return void 0;
  } else {
    const f = parseFloat("0." + fraction) * 1e3;
    return Math.floor(f);
  }
}
function roundTo(number, digits, towardZero = false) {
  const factor = 10 ** digits, rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
}
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
function daysInMonth(year, month) {
  const modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}
function objToLocalTS(obj) {
  let d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond);
  if (obj.year < 100 && obj.year >= 0) {
    d = new Date(d);
    d.setUTCFullYear(obj.year, obj.month - 1, obj.day);
  }
  return +d;
}
function firstWeekOffset(year, minDaysInFirstWeek, startOfWeek) {
  const fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
  return -fwdlw + minDaysInFirstWeek - 1;
}
function weeksInWeekYear(weekYear, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
  const weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
  return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
}
function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else return year > Settings.twoDigitCutoffYear ? 1900 + year : 2e3 + year;
}
function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
  const date = new Date(ts), intlOpts = {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };
  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }
  const modified = {
    timeZoneName: offsetFormat,
    ...intlOpts
  };
  const parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find((m) => m.type.toLowerCase() === "timezonename");
  return parsed ? parsed.value : null;
}
function signedOffset(offHourStr, offMinuteStr) {
  let offHour = parseInt(offHourStr, 10);
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }
  const offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}
function asNumber(value) {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue)) throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
}
function normalizeObject(obj, normalizer) {
  const normalized = {};
  for (const u in obj) {
    if (hasOwnProperty(obj, u)) {
      const v = obj[u];
      if (v === void 0 || v === null) continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }
  return normalized;
}
function formatOffset(offset2, format) {
  const hours = Math.trunc(Math.abs(offset2 / 60)), minutes = Math.trunc(Math.abs(offset2 % 60)), sign = offset2 >= 0 ? "+" : "-";
  switch (format) {
    case "short":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}
function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}
const monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function months(length) {
  switch (length) {
    case "narrow":
      return [...monthsNarrow];
    case "short":
      return [...monthsShort];
    case "long":
      return [...monthsLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    default:
      return null;
  }
}
const weekdaysLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
function weekdays(length) {
  switch (length) {
    case "narrow":
      return [...weekdaysNarrow];
    case "short":
      return [...weekdaysShort];
    case "long":
      return [...weekdaysLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];
    default:
      return null;
  }
}
const meridiems = ["AM", "PM"];
const erasLong = ["Before Christ", "Anno Domini"];
const erasShort = ["BC", "AD"];
const erasNarrow = ["B", "A"];
function eras(length) {
  switch (length) {
    case "narrow":
      return [...erasNarrow];
    case "short":
      return [...erasShort];
    case "long":
      return [...erasLong];
    default:
      return null;
  }
}
function meridiemForDateTime(dt) {
  return meridiems[dt.hour < 12 ? 0 : 1];
}
function weekdayForDateTime(dt, length) {
  return weekdays(length)[dt.weekday - 1];
}
function monthForDateTime(dt, length) {
  return months(length)[dt.month - 1];
}
function eraForDateTime(dt, length) {
  return eras(length)[dt.year < 0 ? 0 : 1];
}
function formatRelativeTime(unit, count2, numeric = "always", narrow = false) {
  const units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  };
  const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;
  if (numeric === "auto" && lastable) {
    const isDay = unit === "days";
    switch (count2) {
      case 1:
        return isDay ? "tomorrow" : `next ${units[unit][0]}`;
      case -1:
        return isDay ? "yesterday" : `last ${units[unit][0]}`;
      case 0:
        return isDay ? "today" : `this ${units[unit][0]}`;
    }
  }
  const isInPast = Object.is(count2, -0) || count2 < 0, fmtValue = Math.abs(count2), singular = fmtValue === 1, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
  return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
}
function stringifyTokens(splits, tokenToString) {
  let s2 = "";
  for (const token of splits) {
    if (token.literal) {
      s2 += token.val;
    } else {
      s2 += tokenToString(token.val);
    }
  }
  return s2;
}
const macroTokenToFormatOpts = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS
};
class Formatter {
  static create(locale, opts = {}) {
    return new Formatter(locale, opts);
  }
  static parseFormat(fmt) {
    let current = null, currentFull = "", bracketed = false;
    const splits = [];
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt.charAt(i);
      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({
            literal: bracketed || /^\s+$/.test(currentFull),
            val: currentFull
          });
        }
        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({
            literal: /^\s+$/.test(currentFull),
            val: currentFull
          });
        }
        currentFull = c;
        current = c;
      }
    }
    if (currentFull.length > 0) {
      splits.push({
        literal: bracketed || /^\s+$/.test(currentFull),
        val: currentFull
      });
    }
    return splits;
  }
  static macroTokenToFormatOpts(token) {
    return macroTokenToFormatOpts[token];
  }
  constructor(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }
  formatWithSystemDefault(dt, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }
    const df = this.systemLoc.dtFormatter(dt, {
      ...this.opts,
      ...opts
    });
    return df.format();
  }
  dtFormatter(dt, opts = {}) {
    return this.loc.dtFormatter(dt, {
      ...this.opts,
      ...opts
    });
  }
  formatDateTime(dt, opts) {
    return this.dtFormatter(dt, opts).format();
  }
  formatDateTimeParts(dt, opts) {
    return this.dtFormatter(dt, opts).formatToParts();
  }
  formatInterval(interval, opts) {
    const df = this.dtFormatter(interval.start, opts);
    return df.dtf.formatRange(interval.start.toJSDate(), interval.end.toJSDate());
  }
  resolvedOptions(dt, opts) {
    return this.dtFormatter(dt, opts).resolvedOptions();
  }
  num(n2, p = 0) {
    if (this.opts.forceSimple) {
      return padStart(n2, p);
    }
    const opts = {
      ...this.opts
    };
    if (p > 0) {
      opts.padTo = p;
    }
    return this.loc.numberFormatter(opts).format(n2);
  }
  formatDateTimeFromString(dt, fmt) {
    const knownEnglish = this.loc.listingMode() === "en", useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", string = (opts, extract) => this.loc.extract(dt, opts, extract), formatOffset2 = (opts) => {
      if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
        return "Z";
      }
      return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
    }, meridiem = () => knownEnglish ? meridiemForDateTime(dt) : string({
      hour: "numeric",
      hourCycle: "h12"
    }, "dayperiod"), month = (length, standalone) => knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
      month: length
    } : {
      month: length,
      day: "numeric"
    }, "month"), weekday = (length, standalone) => knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
      weekday: length
    } : {
      weekday: length,
      month: "long",
      day: "numeric"
    }, "weekday"), maybeMacro = (token) => {
      const formatOpts = Formatter.macroTokenToFormatOpts(token);
      if (formatOpts) {
        return this.formatWithSystemDefault(dt, formatOpts);
      } else {
        return token;
      }
    }, era = (length) => knownEnglish ? eraForDateTime(dt, length) : string({
      era: length
    }, "era"), tokenToString = (token) => {
      switch (token) {
        case "S":
          return this.num(dt.millisecond);
        case "u":
        case "SSS":
          return this.num(dt.millisecond, 3);
        case "s":
          return this.num(dt.second);
        case "ss":
          return this.num(dt.second, 2);
        case "uu":
          return this.num(Math.floor(dt.millisecond / 10), 2);
        case "uuu":
          return this.num(Math.floor(dt.millisecond / 100));
        case "m":
          return this.num(dt.minute);
        case "mm":
          return this.num(dt.minute, 2);
        case "h":
          return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
        case "hh":
          return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
        case "H":
          return this.num(dt.hour);
        case "HH":
          return this.num(dt.hour, 2);
        case "Z":
          return formatOffset2({
            format: "narrow",
            allowZ: this.opts.allowZ
          });
        case "ZZ":
          return formatOffset2({
            format: "short",
            allowZ: this.opts.allowZ
          });
        case "ZZZ":
          return formatOffset2({
            format: "techie",
            allowZ: this.opts.allowZ
          });
        case "ZZZZ":
          return dt.zone.offsetName(dt.ts, {
            format: "short",
            locale: this.loc.locale
          });
        case "ZZZZZ":
          return dt.zone.offsetName(dt.ts, {
            format: "long",
            locale: this.loc.locale
          });
        case "z":
          return dt.zoneName;
        case "a":
          return meridiem();
        case "d":
          return useDateTimeFormatter ? string({
            day: "numeric"
          }, "day") : this.num(dt.day);
        case "dd":
          return useDateTimeFormatter ? string({
            day: "2-digit"
          }, "day") : this.num(dt.day, 2);
        case "c":
          return this.num(dt.weekday);
        case "ccc":
          return weekday("short", true);
        case "cccc":
          return weekday("long", true);
        case "ccccc":
          return weekday("narrow", true);
        case "E":
          return this.num(dt.weekday);
        case "EEE":
          return weekday("short", false);
        case "EEEE":
          return weekday("long", false);
        case "EEEEE":
          return weekday("narrow", false);
        case "L":
          return useDateTimeFormatter ? string({
            month: "numeric",
            day: "numeric"
          }, "month") : this.num(dt.month);
        case "LL":
          return useDateTimeFormatter ? string({
            month: "2-digit",
            day: "numeric"
          }, "month") : this.num(dt.month, 2);
        case "LLL":
          return month("short", true);
        case "LLLL":
          return month("long", true);
        case "LLLLL":
          return month("narrow", true);
        case "M":
          return useDateTimeFormatter ? string({
            month: "numeric"
          }, "month") : this.num(dt.month);
        case "MM":
          return useDateTimeFormatter ? string({
            month: "2-digit"
          }, "month") : this.num(dt.month, 2);
        case "MMM":
          return month("short", false);
        case "MMMM":
          return month("long", false);
        case "MMMMM":
          return month("narrow", false);
        case "y":
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : this.num(dt.year);
        case "yy":
          return useDateTimeFormatter ? string({
            year: "2-digit"
          }, "year") : this.num(dt.year.toString().slice(-2), 2);
        case "yyyy":
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : this.num(dt.year, 4);
        case "yyyyyy":
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : this.num(dt.year, 6);
        case "G":
          return era("short");
        case "GG":
          return era("long");
        case "GGGGG":
          return era("narrow");
        case "kk":
          return this.num(dt.weekYear.toString().slice(-2), 2);
        case "kkkk":
          return this.num(dt.weekYear, 4);
        case "W":
          return this.num(dt.weekNumber);
        case "WW":
          return this.num(dt.weekNumber, 2);
        case "n":
          return this.num(dt.localWeekNumber);
        case "nn":
          return this.num(dt.localWeekNumber, 2);
        case "ii":
          return this.num(dt.localWeekYear.toString().slice(-2), 2);
        case "iiii":
          return this.num(dt.localWeekYear, 4);
        case "o":
          return this.num(dt.ordinal);
        case "ooo":
          return this.num(dt.ordinal, 3);
        case "q":
          return this.num(dt.quarter);
        case "qq":
          return this.num(dt.quarter, 2);
        case "X":
          return this.num(Math.floor(dt.ts / 1e3));
        case "x":
          return this.num(dt.ts);
        default:
          return maybeMacro(token);
      }
    };
    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  }
  formatDurationFromString(dur, fmt) {
    const tokenToField = (token) => {
      switch (token[0]) {
        case "S":
          return "millisecond";
        case "s":
          return "second";
        case "m":
          return "minute";
        case "h":
          return "hour";
        case "d":
          return "day";
        case "w":
          return "week";
        case "M":
          return "month";
        case "y":
          return "year";
        default:
          return null;
      }
    }, tokenToString = (lildur) => (token) => {
      const mapped = tokenToField(token);
      if (mapped) {
        return this.num(lildur.get(mapped), token.length);
      } else {
        return token;
      }
    }, tokens = Formatter.parseFormat(fmt), realTokens = tokens.reduce((found, {
      literal,
      val
    }) => literal ? found : found.concat(val), []), collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t) => t));
    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}
const ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
function combineRegexes(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
}
function combineExtractors(...extractors) {
  return (m) => extractors.reduce(([mergedVals, mergedZone, cursor], ex) => {
    const [val, zone, next] = ex(m, cursor);
    return [{
      ...mergedVals,
      ...val
    }, zone || mergedZone, next];
  }, [{}, null, 1]).slice(0, 2);
}
function parse(s2, ...patterns) {
  if (s2 == null) {
    return [null, null];
  }
  for (const [regex, extractor] of patterns) {
    const m = regex.exec(s2);
    if (m) {
      return extractor(m);
    }
  }
  return [null, null];
}
function simpleParse(...keys2) {
  return (match2, cursor) => {
    const ret = {};
    let i;
    for (i = 0; i < keys2.length; i++) {
      ret[keys2[i]] = parseInteger(match2[cursor + i]);
    }
    return [ret, null, cursor + i];
  };
}
const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
const isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
const isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
const isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
const isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`);
const isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
const isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
const isoOrdinalRegex = /(\d{4})-?(\d{3})/;
const extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
const extractISOOrdinalData = simpleParse("year", "ordinal");
const sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
const sqlTimeRegex = RegExp(`${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`);
const sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);
function int(match2, pos, fallback) {
  const m = match2[pos];
  return isUndefined(m) ? fallback : parseInteger(m);
}
function extractISOYmd(match2, cursor) {
  const item = {
    year: int(match2, cursor),
    month: int(match2, cursor + 1, 1),
    day: int(match2, cursor + 2, 1)
  };
  return [item, null, cursor + 3];
}
function extractISOTime(match2, cursor) {
  const item = {
    hours: int(match2, cursor, 0),
    minutes: int(match2, cursor + 1, 0),
    seconds: int(match2, cursor + 2, 0),
    milliseconds: parseMillis(match2[cursor + 3])
  };
  return [item, null, cursor + 4];
}
function extractISOOffset(match2, cursor) {
  const local = !match2[cursor] && !match2[cursor + 1], fullOffset = signedOffset(match2[cursor + 1], match2[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
  return [{}, zone, cursor + 3];
}
function extractIANAZone(match2, cursor) {
  const zone = match2[cursor] ? IANAZone.create(match2[cursor]) : null;
  return [{}, zone, cursor + 1];
}
const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);
const isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
function extractISODuration(match2) {
  const [s2, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = match2;
  const hasNegativePrefix = s2[0] === "-";
  const negativeSeconds = secondStr && secondStr[0] === "-";
  const maybeNegate = (num, force = false) => num !== void 0 && (force || num && hasNegativePrefix) ? -num : num;
  return [{
    years: maybeNegate(parseFloating(yearStr)),
    months: maybeNegate(parseFloating(monthStr)),
    weeks: maybeNegate(parseFloating(weekStr)),
    days: maybeNegate(parseFloating(dayStr)),
    hours: maybeNegate(parseFloating(hourStr)),
    minutes: maybeNegate(parseFloating(minuteStr)),
    seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
    milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
  }];
}
const obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  const result = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: monthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr)
  };
  if (secondStr) result.second = parseInteger(secondStr);
  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
  }
  return result;
}
const rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
function extractRFC2822(match2) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr, obsOffset, milOffset, offHourStr, offMinuteStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  let offset2;
  if (obsOffset) {
    offset2 = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset2 = 0;
  } else {
    offset2 = signedOffset(offHourStr, offMinuteStr);
  }
  return [result, new FixedOffsetZone(offset2)];
}
function preprocessRFC2822(s2) {
  return s2.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
}
const rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/, rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/, ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
function extractRFC1123Or850(match2) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
function extractASCII(match2) {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
const isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
const extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
const extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset, extractIANAZone);
const extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset, extractIANAZone);
const extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
function parseISODate(s2) {
  return parse(s2, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
}
function parseRFC2822Date(s2) {
  return parse(preprocessRFC2822(s2), [rfc2822, extractRFC2822]);
}
function parseHTTPDate(s2) {
  return parse(s2, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
}
function parseISODuration(s2) {
  return parse(s2, [isoDuration, extractISODuration]);
}
const extractISOTimeOnly = combineExtractors(extractISOTime);
function parseISOTimeOnly(s2) {
  return parse(s2, [isoTimeOnly, extractISOTimeOnly]);
}
const sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
const sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
const extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
function parseSQL(s2) {
  return parse(s2, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
}
const INVALID$2 = "Invalid Duration";
const lowOrderMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1e3
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1e3
  },
  hours: {
    minutes: 60,
    seconds: 60 * 60,
    milliseconds: 60 * 60 * 1e3
  },
  minutes: {
    seconds: 60,
    milliseconds: 60 * 1e3
  },
  seconds: {
    milliseconds: 1e3
  }
}, casualMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1e3
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1e3
  },
  ...lowOrderMatrix
}, daysInYearAccurate = 146097 / 400, daysInMonthAccurate = 146097 / 4800, accurateMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: daysInYearAccurate * 24 / 4,
    minutes: daysInYearAccurate * 24 * 60 / 4,
    seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3 / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1e3
  },
  ...lowOrderMatrix
};
const orderedUnits$1 = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
const reverseUnits = orderedUnits$1.slice(0).reverse();
function clone$1(dur, alts, clear = false) {
  const conf = {
    values: clear ? alts.values : {
      ...dur.values,
      ...alts.values || {}
    },
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
    matrix: alts.matrix || dur.matrix
  };
  return new Duration(conf);
}
function durationToMillis(matrix, vals) {
  var _vals$milliseconds;
  let sum = (_vals$milliseconds = vals.milliseconds) != null ? _vals$milliseconds : 0;
  for (const unit of reverseUnits.slice(1)) {
    if (vals[unit]) {
      sum += vals[unit] * matrix[unit]["milliseconds"];
    }
  }
  return sum;
}
function normalizeValues(matrix, vals) {
  const factor = durationToMillis(matrix, vals) < 0 ? -1 : 1;
  orderedUnits$1.reduceRight((previous, current) => {
    if (!isUndefined(vals[current])) {
      if (previous) {
        const previousVal = vals[previous] * factor;
        const conv = matrix[current][previous];
        const rollUp = Math.floor(previousVal / conv);
        vals[current] += rollUp * factor;
        vals[previous] -= rollUp * conv * factor;
      }
      return current;
    } else {
      return previous;
    }
  }, null);
  orderedUnits$1.reduce((previous, current) => {
    if (!isUndefined(vals[current])) {
      if (previous) {
        const fraction = vals[previous] % 1;
        vals[previous] -= fraction;
        vals[current] += fraction * matrix[previous][current];
      }
      return current;
    } else {
      return previous;
    }
  }, null);
}
function removeZeroes(vals) {
  const newVals = {};
  for (const [key, value] of Object.entries(vals)) {
    if (value !== 0) {
      newVals[key] = value;
    }
  }
  return newVals;
}
class Duration {
  /**
   * @private
   */
  constructor(config) {
    const accurate = config.conversionAccuracy === "longterm" || false;
    let matrix = accurate ? accurateMatrix : casualMatrix;
    if (config.matrix) {
      matrix = config.matrix;
    }
    this.values = config.values;
    this.loc = config.loc || Locale.create();
    this.conversionAccuracy = accurate ? "longterm" : "casual";
    this.invalid = config.invalid || null;
    this.matrix = matrix;
    this.isLuxonDuration = true;
  }
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  static fromMillis(count2, opts) {
    return Duration.fromObject({
      milliseconds: count2
    }, opts);
  }
  /**
   * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {Object} [opts=[]] - options for creating this Duration
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the custom conversion system to use
   * @return {Duration}
   */
  static fromObject(obj, opts = {}) {
    if (obj == null || typeof obj !== "object") {
      throw new InvalidArgumentError(`Duration.fromObject: argument expected to be an object, got ${obj === null ? "null" : typeof obj}`);
    }
    return new Duration({
      values: normalizeObject(obj, Duration.normalizeUnit),
      loc: Locale.fromObject(opts),
      conversionAccuracy: opts.conversionAccuracy,
      matrix: opts.matrix
    });
  }
  /**
   * Create a Duration from DurationLike.
   *
   * @param {Object | number | Duration} durationLike
   * One of:
   * - object with keys like 'years' and 'hours'.
   * - number representing milliseconds
   * - Duration instance
   * @return {Duration}
   */
  static fromDurationLike(durationLike) {
    if (isNumber(durationLike)) {
      return Duration.fromMillis(durationLike);
    } else if (Duration.isDuration(durationLike)) {
      return durationLike;
    } else if (typeof durationLike === "object") {
      return Duration.fromObject(durationLike);
    } else {
      throw new InvalidArgumentError(`Unknown duration argument ${durationLike} of type ${typeof durationLike}`);
    }
  }
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the preset conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(text, opts) {
    const [parsed] = parseISODuration(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  /**
   * Create a Duration from an ISO 8601 time string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
   * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @return {Duration}
   */
  static fromISOTime(text, opts) {
    const [parsed] = parseISOTimeOnly(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidDurationError(invalid);
    } else {
      return new Duration({
        invalid
      });
    }
  }
  /**
   * @private
   */
  static normalizeUnit(unit) {
    const normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[unit ? unit.toLowerCase() : unit];
    if (!normalized) throw new InvalidUnitError(unit);
    return normalized;
  }
  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDuration(o) {
    return o && o.isLuxonDuration || false;
  }
  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `w` for weeks
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * Tokens can be escaped by wrapping with single quotes.
   * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    const fmtOpts = {
      ...opts,
      floor: opts.round !== false && opts.floor !== false
    };
    return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID$2;
  }
  /**
   * Returns a string representation of a Duration with all units included.
   * To modify its behavior, use `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
   * @param {Object} opts - Formatting options. Accepts the same keys as the options parameter of the native `Intl.NumberFormat` constructor, as well as `listStyle`.
   * @param {string} [opts.listStyle='narrow'] - How to format the merged list. Corresponds to the `style` property of the options parameter of the native `Intl.ListFormat` constructor.
   * @example
   * ```js
   * var dur = Duration.fromObject({ days: 1, hours: 5, minutes: 6 })
   * dur.toHuman() //=> '1 day, 5 hours, 6 minutes'
   * dur.toHuman({ listStyle: "long" }) //=> '1 day, 5 hours, and 6 minutes'
   * dur.toHuman({ unitDisplay: "short" }) //=> '1 day, 5 hr, 6 min'
   * ```
   */
  toHuman(opts = {}) {
    if (!this.isValid) return INVALID$2;
    const l2 = orderedUnits$1.map((unit) => {
      const val = this.values[unit];
      if (isUndefined(val)) {
        return null;
      }
      return this.loc.numberFormatter({
        style: "unit",
        unitDisplay: "long",
        ...opts,
        unit: unit.slice(0, -1)
      }).format(val);
    }).filter((n2) => n2);
    return this.loc.listFormatter({
      type: "conjunction",
      style: opts.listStyle || "narrow",
      ...opts
    }).format(l2);
  }
  /**
   * Returns a JavaScript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  toObject() {
    if (!this.isValid) return {};
    return {
      ...this.values
    };
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  toISO() {
    if (!this.isValid) return null;
    let s2 = "P";
    if (this.years !== 0) s2 += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0) s2 += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0) s2 += this.weeks + "W";
    if (this.days !== 0) s2 += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) s2 += "T";
    if (this.hours !== 0) s2 += this.hours + "H";
    if (this.minutes !== 0) s2 += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0)
      s2 += roundTo(this.seconds + this.milliseconds / 1e3, 3) + "S";
    if (s2 === "P") s2 += "T0S";
    return s2;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
   * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
   * @return {string}
   */
  toISOTime(opts = {}) {
    if (!this.isValid) return null;
    const millis = this.toMillis();
    if (millis < 0 || millis >= 864e5) return null;
    opts = {
      suppressMilliseconds: false,
      suppressSeconds: false,
      includePrefix: false,
      format: "extended",
      ...opts,
      includeOffset: false
    };
    const dateTime = DateTime$1.fromMillis(millis, {
      zone: "UTC"
    });
    return dateTime.toISOTime(opts);
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  toString() {
    return this.toISO();
  }
  /**
   * Returns a string representation of this Duration appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Duration { values: ${JSON.stringify(this.values)} }`;
    } else {
      return `Duration { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  toMillis() {
    if (!this.isValid) return NaN;
    return durationToMillis(this.matrix, this.values);
  }
  /**
   * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(duration) {
    if (!this.isValid) return this;
    const dur = Duration.fromDurationLike(duration), result = {};
    for (const k of orderedUnits$1) {
      if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
        result[k] = dur.get(k) + this.get(k);
      }
    }
    return clone$1(this, {
      values: result
    }, true);
  }
  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(duration) {
    if (!this.isValid) return this;
    const dur = Duration.fromDurationLike(duration);
    return this.plus(dur.negate());
  }
  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hours" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  mapUnits(fn) {
    if (!this.isValid) return this;
    const result = {};
    for (const k of Object.keys(this.values)) {
      result[k] = asNumber(fn(this.values[k], k));
    }
    return clone$1(this, {
      values: result
    }, true);
  }
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
   * @return {number}
   */
  get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }
  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values) {
    if (!this.isValid) return this;
    const mixed = {
      ...this.values,
      ...normalizeObject(values, Duration.normalizeUnit)
    };
    return clone$1(this, {
      values: mixed
    });
  }
  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  reconfigure({
    locale,
    numberingSystem,
    conversionAccuracy,
    matrix
  } = {}) {
    const loc = this.loc.clone({
      locale,
      numberingSystem
    });
    const opts = {
      loc,
      matrix,
      conversionAccuracy
    };
    return clone$1(this, opts);
  }
  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }
  /**
   * Reduce this Duration to its canonical representation in its current units.
   * Assuming the overall value of the Duration is positive, this means:
   * - excessive values for lower-order units are converted to higher-order units (if possible, see first and second example)
   * - negative lower-order units are converted to higher order units (there must be such a higher order unit, otherwise
   *   the overall value would be negative, see third example)
   * - fractional values for higher-order units are converted to lower-order units (if possible, see fourth example)
   *
   * If the overall value is negative, the result of this method is equivalent to `this.negate().normalize().negate()`.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ days: 5000 }).normalize().toObject() //=> { days: 5000 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @example Duration.fromObject({ years: 2.5, days: 0, hours: 0 }).normalize().toObject() //=> { years: 2, days: 182, hours: 12 }
   * @return {Duration}
   */
  normalize() {
    if (!this.isValid) return this;
    const vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone$1(this, {
      values: vals
    }, true);
  }
  /**
   * Rescale units to its largest representation
   * @example Duration.fromObject({ milliseconds: 90000 }).rescale().toObject() //=> { minutes: 1, seconds: 30 }
   * @return {Duration}
   */
  rescale() {
    if (!this.isValid) return this;
    const vals = removeZeroes(this.normalize().shiftToAll().toObject());
    return clone$1(this, {
      values: vals
    }, true);
  }
  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (!this.isValid) return this;
    if (units.length === 0) {
      return this;
    }
    units = units.map((u) => Duration.normalizeUnit(u));
    const built = {}, accumulated = {}, vals = this.toObject();
    let lastUnit;
    for (const k of orderedUnits$1) {
      if (units.indexOf(k) >= 0) {
        lastUnit = k;
        let own = 0;
        for (const ak in accumulated) {
          own += this.matrix[ak][k] * accumulated[ak];
          accumulated[ak] = 0;
        }
        if (isNumber(vals[k])) {
          own += vals[k];
        }
        const i = Math.trunc(own);
        built[k] = i;
        accumulated[k] = (own * 1e3 - i * 1e3) / 1e3;
      } else if (isNumber(vals[k])) {
        accumulated[k] = vals[k];
      }
    }
    for (const key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }
    normalizeValues(this.matrix, built);
    return clone$1(this, {
      values: built
    }, true);
  }
  /**
   * Shift this Duration to all available units.
   * Same as shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds")
   * @return {Duration}
   */
  shiftToAll() {
    if (!this.isValid) return this;
    return this.shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds");
  }
  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    if (!this.isValid) return this;
    const negated = {};
    for (const k of Object.keys(this.values)) {
      negated[k] = this.values[k] === 0 ? 0 : -this.values[k];
    }
    return clone$1(this, {
      values: negated
    }, true);
  }
  /**
   * Get the years.
   * @type {number}
   */
  get years() {
    return this.isValid ? this.values.years || 0 : NaN;
  }
  /**
   * Get the quarters.
   * @type {number}
   */
  get quarters() {
    return this.isValid ? this.values.quarters || 0 : NaN;
  }
  /**
   * Get the months.
   * @type {number}
   */
  get months() {
    return this.isValid ? this.values.months || 0 : NaN;
  }
  /**
   * Get the weeks
   * @type {number}
   */
  get weeks() {
    return this.isValid ? this.values.weeks || 0 : NaN;
  }
  /**
   * Get the days.
   * @type {number}
   */
  get days() {
    return this.isValid ? this.values.days || 0 : NaN;
  }
  /**
   * Get the hours.
   * @type {number}
   */
  get hours() {
    return this.isValid ? this.values.hours || 0 : NaN;
  }
  /**
   * Get the minutes.
   * @type {number}
   */
  get minutes() {
    return this.isValid ? this.values.minutes || 0 : NaN;
  }
  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.isValid ? this.values.seconds || 0 : NaN;
  }
  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.isValid ? this.values.milliseconds || 0 : NaN;
  }
  /**
   * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
   * on invalid DateTimes or Intervals.
   * @return {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this Duration became invalid, or null if the Duration is valid
   * @return {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    if (!this.loc.equals(other.loc)) {
      return false;
    }
    function eq(v1, v2) {
      if (v1 === void 0 || v1 === 0) return v2 === void 0 || v2 === 0;
      return v1 === v2;
    }
    for (const u of orderedUnits$1) {
      if (!eq(this.values[u], other.values[u])) {
        return false;
      }
    }
    return true;
  }
}
const INVALID$1 = "Invalid Interval";
function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid("end before start", `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`);
  } else {
    return null;
  }
}
class Interval {
  /**
   * @private
   */
  constructor(config) {
    this.s = config.start;
    this.e = config.end;
    this.invalid = config.invalid || null;
    this.isLuxonInterval = true;
  }
  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidIntervalError(invalid);
    } else {
      return new Interval({
        invalid
      });
    }
  }
  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  static fromDateTimes(start, end) {
    const builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
    const validateError = validateStartEnd(builtStart, builtEnd);
    if (validateError == null) {
      return new Interval({
        start: builtStart,
        end: builtEnd
      });
    } else {
      return validateError;
    }
  }
  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static after(start, duration) {
    const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(start);
    return Interval.fromDateTimes(dt, dt.plus(dur));
  }
  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static before(end, duration) {
    const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(end);
    return Interval.fromDateTimes(dt.minus(dur), dt);
  }
  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  static fromISO(text, opts) {
    const [s2, e] = (text || "").split("/", 2);
    if (s2 && e) {
      let start, startIsValid;
      try {
        start = DateTime$1.fromISO(s2, opts);
        startIsValid = start.isValid;
      } catch (e2) {
        startIsValid = false;
      }
      let end, endIsValid;
      try {
        end = DateTime$1.fromISO(e, opts);
        endIsValid = end.isValid;
      } catch (e2) {
        endIsValid = false;
      }
      if (startIsValid && endIsValid) {
        return Interval.fromDateTimes(start, end);
      }
      if (startIsValid) {
        const dur = Duration.fromISO(e, opts);
        if (dur.isValid) {
          return Interval.after(start, dur);
        }
      } else if (endIsValid) {
        const dur = Duration.fromISO(s2, opts);
        if (dur.isValid) {
          return Interval.before(end, dur);
        }
      }
    }
    return Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
  }
  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isInterval(o) {
    return o && o.isLuxonInterval || false;
  }
  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  get start() {
    return this.isValid ? this.s : null;
  }
  /**
   * Returns the end of the Interval
   * @type {DateTime}
   */
  get end() {
    return this.isValid ? this.e : null;
  }
  /**
   * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
   * @type {boolean}
   */
  get isValid() {
    return this.invalidReason === null;
  }
  /**
   * Returns an error code if this Interval is invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  length(unit = "milliseconds") {
    return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
  }
  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; this operation will always use the locale of the start DateTime
   * @return {number}
   */
  count(unit = "milliseconds", opts) {
    if (!this.isValid) return NaN;
    const start = this.start.startOf(unit, opts);
    let end;
    if (opts != null && opts.useLocaleWeeks) {
      end = this.end.reconfigure({
        locale: start.locale
      });
    } else {
      end = this.end;
    }
    end = end.startOf(unit, opts);
    return Math.floor(end.diff(start, unit).get(unit)) + (end.valueOf() !== this.end.valueOf());
  }
  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }
  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isAfter(dateTime) {
    if (!this.isValid) return false;
    return this.s > dateTime;
  }
  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isBefore(dateTime) {
    if (!this.isValid) return false;
    return this.e <= dateTime;
  }
  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  contains(dateTime) {
    if (!this.isValid) return false;
    return this.s <= dateTime && this.e > dateTime;
  }
  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  set({
    start,
    end
  } = {}) {
    if (!this.isValid) return this;
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }
  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...DateTime} dateTimes - the unit of time to count.
   * @return {Array}
   */
  splitAt(...dateTimes) {
    if (!this.isValid) return [];
    const sorted = dateTimes.map(friendlyDateTime).filter((d) => this.contains(d)).sort((a, b) => a.toMillis() - b.toMillis()), results = [];
    let {
      s: s2
    } = this, i = 0;
    while (s2 < this.e) {
      const added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s2, next));
      s2 = next;
      i += 1;
    }
    return results;
  }
  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {Array}
   */
  splitBy(duration) {
    const dur = Duration.fromDurationLike(duration);
    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }
    let {
      s: s2
    } = this, idx = 1, next;
    const results = [];
    while (s2 < this.e) {
      const added = this.start.plus(dur.mapUnits((x) => x * idx));
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s2, next));
      s2 = next;
      idx += 1;
    }
    return results;
  }
  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {Array}
   */
  divideEqually(numberOfParts) {
    if (!this.isValid) return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }
  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }
  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsStart(other) {
    if (!this.isValid) return false;
    return +this.e === +other.s;
  }
  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsEnd(other) {
    if (!this.isValid) return false;
    return +other.e === +this.s;
  }
  /**
   * Returns true if this Interval fully contains the specified Interval, specifically if the intersect (of this Interval and the other Interval) is equal to the other Interval; false otherwise.
   * @param {Interval} other
   * @return {boolean}
   */
  engulfs(other) {
    if (!this.isValid) return false;
    return this.s <= other.s && this.e >= other.e;
  }
  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    return this.s.equals(other.s) && this.e.equals(other.e);
  }
  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  intersection(other) {
    if (!this.isValid) return this;
    const s2 = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;
    if (s2 >= e) {
      return null;
    } else {
      return Interval.fromDateTimes(s2, e);
    }
  }
  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  union(other) {
    if (!this.isValid) return this;
    const s2 = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s2, e);
  }
  /**
   * Merge an array of Intervals into a equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static merge(intervals) {
    const [found, final] = intervals.sort((a, b) => a.s - b.s).reduce(([sofar, current], item) => {
      if (!current) {
        return [sofar, item];
      } else if (current.overlaps(item) || current.abutsStart(item)) {
        return [sofar, current.union(item)];
      } else {
        return [sofar.concat([current]), item];
      }
    }, [[], null]);
    if (final) {
      found.push(final);
    }
    return found;
  }
  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static xor(intervals) {
    let start = null, currentCount = 0;
    const results = [], ends = intervals.map((i) => [{
      time: i.s,
      type: "s"
    }, {
      time: i.e,
      type: "e"
    }]), flattened = Array.prototype.concat(...ends), arr = flattened.sort((a, b) => a.time - b.time);
    for (const i of arr) {
      currentCount += i.type === "s" ? 1 : -1;
      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(Interval.fromDateTimes(start, i.time));
        }
        start = null;
      }
    }
    return Interval.merge(results);
  }
  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {Array}
   */
  difference(...intervals) {
    return Interval.xor([this].concat(intervals)).map((i) => this.intersection(i)).filter((i) => i && !i.isEmpty());
  }
  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  toString() {
    if (!this.isValid) return INVALID$1;
    return `[${this.s.toISO()} – ${this.e.toISO()})`;
  }
  /**
   * Returns a string representation of this Interval appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`;
    } else {
      return `Interval { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns a localized string representing this Interval. Accepts the same options as the
   * Intl.DateTimeFormat constructor and any presets defined by Luxon, such as
   * {@link DateTime.DATE_FULL} or {@link DateTime.TIME_SIMPLE}. The exact behavior of this method
   * is browser-specific, but in general it will return an appropriate representation of the
   * Interval in the assigned locale. Defaults to the system's locale if no locale has been
   * specified.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {Object} [formatOpts=DateTime.DATE_SHORT] - Either a DateTime preset or
   * Intl.DateTimeFormat constructor options.
   * @param {Object} opts - Options to override the configuration of the start DateTime.
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(); //=> 11/7/2022 – 11/8/2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL); //=> November 7 – 8, 2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL, { locale: 'fr-FR' }); //=> 7–8 novembre 2022
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString(DateTime.TIME_SIMPLE); //=> 6:00 – 8:00 PM
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> Mon, Nov 07, 6:00 – 8:00 p
   * @return {string}
   */
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.s.loc.clone(opts), formatOpts).formatInterval(this) : INVALID$1;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISO(opts) {
    if (!this.isValid) return INVALID$1;
    return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
  }
  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  toISODate() {
    if (!this.isValid) return INVALID$1;
    return `${this.s.toISODate()}/${this.e.toISODate()}`;
  }
  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISOTime(opts) {
    if (!this.isValid) return INVALID$1;
    return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
  }
  /**
   * Returns a string representation of this Interval formatted according to the specified format
   * string. **You may not want this.** See {@link Interval#toLocaleString} for a more flexible
   * formatting tool.
   * @param {string} dateFormat - The format string. This string formats the start and end time.
   * See {@link DateTime#toFormat} for details.
   * @param {Object} opts - Options.
   * @param {string} [opts.separator =  ' – '] - A separator to place between the start and end
   * representations.
   * @return {string}
   */
  toFormat(dateFormat, {
    separator = " – "
  } = {}) {
    if (!this.isValid) return INVALID$1;
    return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
  }
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  toDuration(unit, opts) {
    if (!this.isValid) {
      return Duration.invalid(this.invalidReason);
    }
    return this.e.diff(this.s, unit, opts);
  }
  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  mapEndpoints(mapFn) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  }
}
class Info {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(zone = Settings.defaultZone) {
    const proto = DateTime$1.now().setZone(zone).set({
      month: 12
    });
    return !zone.isUniversal && proto.offset !== proto.set({
      month: 6
    }).offset;
  }
  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  static isValidIANAZone(zone) {
    return IANAZone.isValidZone(zone);
  }
  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone#isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  static normalizeZone(input) {
    return normalizeZone(input, Settings.defaultZone);
  }
  /**
   * Get the weekday on which the week starts according to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number} the start of the week, 1 for Monday through 7 for Sunday
   */
  static getStartOfWeek({
    locale = null,
    locObj = null
  } = {}) {
    return (locObj || Locale.create(locale)).getStartOfWeek();
  }
  /**
   * Get the minimum number of days necessary in a week before it is considered part of the next year according
   * to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number}
   */
  static getMinimumDaysInFirstWeek({
    locale = null,
    locObj = null
  } = {}) {
    return (locObj || Locale.create(locale)).getMinDaysInFirstWeek();
  }
  /**
   * Get the weekdays, which are considered the weekend according to the given locale
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number[]} an array of weekdays, 1 for Monday through 7 for Sunday
   */
  static getWeekendWeekdays({
    locale = null,
    locObj = null
  } = {}) {
    return (locObj || Locale.create(locale)).getWeekendDays().slice();
  }
  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {Array}
   */
  static months(length = "long", {
    locale = null,
    numberingSystem = null,
    locObj = null,
    outputCalendar = "gregory"
  } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
  }
  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link Info#months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {Array}
   */
  static monthsFormat(length = "long", {
    locale = null,
    numberingSystem = null,
    locObj = null,
    outputCalendar = "gregory"
  } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
  }
  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {Array}
   */
  static weekdays(length = "long", {
    locale = null,
    numberingSystem = null,
    locObj = null
  } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
  }
  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link Info#weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @return {Array}
   */
  static weekdaysFormat(length = "long", {
    locale = null,
    numberingSystem = null,
    locObj = null
  } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
  }
  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {Array}
   */
  static meridiems({
    locale = null
  } = {}) {
    return Locale.create(locale).meridiems();
  }
  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {Array}
   */
  static eras(length = "short", {
    locale = null
  } = {}) {
    return Locale.create(locale, null, "gregory").eras(length);
  }
  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `relative`: whether this environment supports relative time formatting
   * * `localeWeek`: whether this environment supports different weekdays for the start of the week based on the locale
   * @example Info.features() //=> { relative: false, localeWeek: true }
   * @return {Object}
   */
  static features() {
    return {
      relative: hasRelative(),
      localeWeek: hasLocaleWeekInfo()
    };
  }
}
function dayDiff(earlier, later) {
  const utcDayStart = (dt) => dt.toUTC(0, {
    keepLocalTime: true
  }).startOf("day").valueOf(), ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}
function highOrderDiffs(cursor, later, units) {
  const differs = [["years", (a, b) => b.year - a.year], ["quarters", (a, b) => b.quarter - a.quarter + (b.year - a.year) * 4], ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12], ["weeks", (a, b) => {
    const days = dayDiff(a, b);
    return (days - days % 7) / 7;
  }], ["days", dayDiff]];
  const results = {};
  const earlier = cursor;
  let lowestOrder, highWater;
  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;
      results[unit] = differ(cursor, later);
      highWater = earlier.plus(results);
      if (highWater > later) {
        results[unit]--;
        cursor = earlier.plus(results);
        if (cursor > later) {
          highWater = cursor;
          results[unit]--;
          cursor = earlier.plus(results);
        }
      } else {
        cursor = highWater;
      }
    }
  }
  return [cursor, results, highWater, lowestOrder];
}
function diff(earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);
  const remainingMillis = later - cursor;
  const lowerOrderUnits = units.filter((u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0);
  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({
        [lowestOrder]: 1
      });
    }
    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }
  const duration = Duration.fromObject(results, opts);
  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, opts).shiftTo(...lowerOrderUnits).plus(duration);
  } else {
    return duration;
  }
}
const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
function intUnit(regex, post = (i) => i) {
  return {
    regex,
    deser: ([s2]) => post(parseDigits(s2))
  };
}
const NBSP = String.fromCharCode(160);
const spaceOrNBSP = `[ ${NBSP}]`;
const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
function fixListRegex(s2) {
  return s2.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}
function stripInsensitivities(s2) {
  return s2.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
}
function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: ([s2]) => strings.findIndex((i) => stripInsensitivities(s2) === stripInsensitivities(i)) + startIndex
    };
  }
}
function offset(regex, groups) {
  return {
    regex,
    deser: ([, h, m]) => signedOffset(h, m),
    groups
  };
}
function simple(regex) {
  return {
    regex,
    deser: ([s2]) => s2
  };
}
function escapeToken(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function unitForToken(token, loc) {
  const one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = (t) => ({
    regex: RegExp(escapeToken(t.val)),
    deser: ([s2]) => s2,
    literal: true
  }), unitate = (t) => {
    if (token.literal) {
      return literal(t);
    }
    switch (t.val) {
      case "G":
        return oneOf(loc.eras("short"), 0);
      case "GG":
        return oneOf(loc.eras("long"), 0);
      case "y":
        return intUnit(oneToSix);
      case "yy":
        return intUnit(twoToFour, untruncateYear);
      case "yyyy":
        return intUnit(four);
      case "yyyyy":
        return intUnit(fourToSix);
      case "yyyyyy":
        return intUnit(six);
      case "M":
        return intUnit(oneOrTwo);
      case "MM":
        return intUnit(two);
      case "MMM":
        return oneOf(loc.months("short", true), 1);
      case "MMMM":
        return oneOf(loc.months("long", true), 1);
      case "L":
        return intUnit(oneOrTwo);
      case "LL":
        return intUnit(two);
      case "LLL":
        return oneOf(loc.months("short", false), 1);
      case "LLLL":
        return oneOf(loc.months("long", false), 1);
      case "d":
        return intUnit(oneOrTwo);
      case "dd":
        return intUnit(two);
      case "o":
        return intUnit(oneToThree);
      case "ooo":
        return intUnit(three);
      case "HH":
        return intUnit(two);
      case "H":
        return intUnit(oneOrTwo);
      case "hh":
        return intUnit(two);
      case "h":
        return intUnit(oneOrTwo);
      case "mm":
        return intUnit(two);
      case "m":
        return intUnit(oneOrTwo);
      case "q":
        return intUnit(oneOrTwo);
      case "qq":
        return intUnit(two);
      case "s":
        return intUnit(oneOrTwo);
      case "ss":
        return intUnit(two);
      case "S":
        return intUnit(oneToThree);
      case "SSS":
        return intUnit(three);
      case "u":
        return simple(oneToNine);
      case "uu":
        return simple(oneOrTwo);
      case "uuu":
        return intUnit(one);
      case "a":
        return oneOf(loc.meridiems(), 0);
      case "kkkk":
        return intUnit(four);
      case "kk":
        return intUnit(twoToFour, untruncateYear);
      case "W":
        return intUnit(oneOrTwo);
      case "WW":
        return intUnit(two);
      case "E":
      case "c":
        return intUnit(one);
      case "EEE":
        return oneOf(loc.weekdays("short", false), 1);
      case "EEEE":
        return oneOf(loc.weekdays("long", false), 1);
      case "ccc":
        return oneOf(loc.weekdays("short", true), 1);
      case "cccc":
        return oneOf(loc.weekdays("long", true), 1);
      case "Z":
      case "ZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
      case "ZZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);
      case " ":
        return simple(/[^\S\n\r]/);
      default:
        return literal(t);
    }
  };
  const unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };
  unit.token = token;
  return unit;
}
const partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour12: {
    numeric: "h",
    "2-digit": "hh"
  },
  hour24: {
    numeric: "H",
    "2-digit": "HH"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  },
  timeZoneName: {
    long: "ZZZZZ",
    short: "ZZZ"
  }
};
function tokenForPart(part, formatOpts, resolvedOpts) {
  const {
    type,
    value
  } = part;
  if (type === "literal") {
    const isSpace = /^\s+$/.test(value);
    return {
      literal: !isSpace,
      val: isSpace ? " " : value
    };
  }
  const style = formatOpts[type];
  let actualType = type;
  if (type === "hour") {
    if (formatOpts.hour12 != null) {
      actualType = formatOpts.hour12 ? "hour12" : "hour24";
    } else if (formatOpts.hourCycle != null) {
      if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
        actualType = "hour12";
      } else {
        actualType = "hour24";
      }
    } else {
      actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
    }
  }
  let val = partTypeStyleToTokenVal[actualType];
  if (typeof val === "object") {
    val = val[style];
  }
  if (val) {
    return {
      literal: false,
      val
    };
  }
  return void 0;
}
function buildRegex(units) {
  const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
  return [`^${re}$`, units];
}
function match(input, regex, handlers) {
  const matches = input.match(regex);
  if (matches) {
    const all = {};
    let matchIndex = 1;
    for (const i in handlers) {
      if (hasOwnProperty(handlers, i)) {
        const h = handlers[i], groups = h.groups ? h.groups + 1 : 1;
        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }
        matchIndex += groups;
      }
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}
function dateTimeFromMatches(matches) {
  const toField = (token) => {
    switch (token) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };
  let zone = null;
  let specificOffset;
  if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z);
  }
  if (!isUndefined(matches.Z)) {
    if (!zone) {
      zone = new FixedOffsetZone(matches.Z);
    }
    specificOffset = matches.Z;
  }
  if (!isUndefined(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }
  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }
  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }
  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }
  const vals = Object.keys(matches).reduce((r, k) => {
    const f = toField(k);
    if (f) {
      r[f] = matches[k];
    }
    return r;
  }, {});
  return [vals, zone, specificOffset];
}
let dummyDateTimeCache = null;
function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime$1.fromMillis(1555555555555);
  }
  return dummyDateTimeCache;
}
function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }
  const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
  const tokens = formatOptsToTokens(formatOpts, locale);
  if (tokens == null || tokens.includes(void 0)) {
    return token;
  }
  return tokens;
}
function expandMacroTokens(tokens, locale) {
  return Array.prototype.concat(...tokens.map((t) => maybeExpandMacroToken(t, locale)));
}
class TokenParser {
  constructor(locale, format) {
    this.locale = locale;
    this.format = format;
    this.tokens = expandMacroTokens(Formatter.parseFormat(format), locale);
    this.units = this.tokens.map((t) => unitForToken(t, locale));
    this.disqualifyingUnit = this.units.find((t) => t.invalidReason);
    if (!this.disqualifyingUnit) {
      const [regexString, handlers] = buildRegex(this.units);
      this.regex = RegExp(regexString, "i");
      this.handlers = handlers;
    }
  }
  explainFromTokens(input) {
    if (!this.isValid) {
      return {
        input,
        tokens: this.tokens,
        invalidReason: this.invalidReason
      };
    } else {
      const [rawMatches, matches] = match(input, this.regex, this.handlers), [result, zone, specificOffset] = matches ? dateTimeFromMatches(matches) : [null, null, void 0];
      if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
        throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
      }
      return {
        input,
        tokens: this.tokens,
        regex: this.regex,
        rawMatches,
        matches,
        result,
        zone,
        specificOffset
      };
    }
  }
  get isValid() {
    return !this.disqualifyingUnit;
  }
  get invalidReason() {
    return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
  }
}
function explainFromTokens(locale, input, format) {
  const parser = new TokenParser(locale, format);
  return parser.explainFromTokens(input);
}
function parseFromTokens(locale, input, format) {
  const {
    result,
    zone,
    specificOffset,
    invalidReason
  } = explainFromTokens(locale, input, format);
  return [result, zone, specificOffset, invalidReason];
}
function formatOptsToTokens(formatOpts, locale) {
  if (!formatOpts) {
    return null;
  }
  const formatter = Formatter.create(locale, formatOpts);
  const df = formatter.dtFormatter(getDummyDateTime());
  const parts = df.formatToParts();
  const resolvedOpts = df.resolvedOptions();
  return parts.map((p) => tokenForPart(p, formatOpts, resolvedOpts));
}
const INVALID = "Invalid DateTime";
const MAX_DATE = 864e13;
function unsupportedZone(zone) {
  return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
}
function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = gregorianToWeek(dt.c);
  }
  return dt.weekData;
}
function possiblyCachedLocalWeekData(dt) {
  if (dt.localWeekData === null) {
    dt.localWeekData = gregorianToWeek(dt.c, dt.loc.getMinDaysInFirstWeek(), dt.loc.getStartOfWeek());
  }
  return dt.localWeekData;
}
function clone(inst, alts) {
  const current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid
  };
  return new DateTime$1({
    ...current,
    ...alts,
    old: current
  });
}
function fixOffset(localTS, o, tz2) {
  let utcGuess = localTS - o * 60 * 1e3;
  const o2 = tz2.offset(utcGuess);
  if (o === o2) {
    return [utcGuess, o];
  }
  utcGuess -= (o2 - o) * 60 * 1e3;
  const o3 = tz2.offset(utcGuess);
  if (o2 === o3) {
    return [utcGuess, o2];
  }
  return [localTS - Math.min(o2, o3) * 60 * 1e3, Math.max(o2, o3)];
}
function tsToObj(ts, offset2) {
  ts += offset2 * 60 * 1e3;
  const d = new Date(ts);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
}
function objToTS(obj, offset2, zone) {
  return fixOffset(objToLocalTS(obj), offset2, zone);
}
function adjustTime(inst, dur) {
  const oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3, c = {
    ...inst.c,
    year,
    month,
    day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
  }, millisToAdd = Duration.fromObject({
    years: dur.years - Math.trunc(dur.years),
    quarters: dur.quarters - Math.trunc(dur.quarters),
    months: dur.months - Math.trunc(dur.months),
    weeks: dur.weeks - Math.trunc(dur.weeks),
    days: dur.days - Math.trunc(dur.days),
    hours: dur.hours,
    minutes: dur.minutes,
    seconds: dur.seconds,
    milliseconds: dur.milliseconds
  }).as("milliseconds"), localTS = objToLocalTS(c);
  let [ts, o] = fixOffset(localTS, oPre, inst.zone);
  if (millisToAdd !== 0) {
    ts += millisToAdd;
    o = inst.zone.offset(ts);
  }
  return {
    ts,
    o
  };
}
function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
  const {
    setZone,
    zone
  } = opts;
  if (parsed && Object.keys(parsed).length !== 0 || parsedZone) {
    const interpretationZone = parsedZone || zone, inst = DateTime$1.fromObject(parsed, {
      ...opts,
      zone: interpretationZone,
      specificOffset
    });
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime$1.invalid(new Invalid("unparsable", `the input "${text}" can't be parsed as ${format}`));
  }
}
function toTechFormat(dt, format, allowZ = true) {
  return dt.isValid ? Formatter.create(Locale.create("en-US"), {
    allowZ,
    forceSimple: true
  }).formatDateTimeFromString(dt, format) : null;
}
function toISODate(o, extended) {
  const longFormat = o.c.year > 9999 || o.c.year < 0;
  let c = "";
  if (longFormat && o.c.year >= 0) c += "+";
  c += padStart(o.c.year, longFormat ? 6 : 4);
  if (extended) {
    c += "-";
    c += padStart(o.c.month);
    c += "-";
    c += padStart(o.c.day);
  } else {
    c += padStart(o.c.month);
    c += padStart(o.c.day);
  }
  return c;
}
function toISOTime(o, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone) {
  let c = padStart(o.c.hour);
  if (extended) {
    c += ":";
    c += padStart(o.c.minute);
    if (o.c.millisecond !== 0 || o.c.second !== 0 || !suppressSeconds) {
      c += ":";
    }
  } else {
    c += padStart(o.c.minute);
  }
  if (o.c.millisecond !== 0 || o.c.second !== 0 || !suppressSeconds) {
    c += padStart(o.c.second);
    if (o.c.millisecond !== 0 || !suppressMilliseconds) {
      c += ".";
      c += padStart(o.c.millisecond, 3);
    }
  }
  if (includeOffset) {
    if (o.isOffsetFixed && o.offset === 0 && !extendedZone) {
      c += "Z";
    } else if (o.o < 0) {
      c += "-";
      c += padStart(Math.trunc(-o.o / 60));
      c += ":";
      c += padStart(Math.trunc(-o.o % 60));
    } else {
      c += "+";
      c += padStart(Math.trunc(o.o / 60));
      c += ":";
      c += padStart(Math.trunc(o.o % 60));
    }
  }
  if (extendedZone) {
    c += "[" + o.zone.ianaName + "]";
  }
  return c;
}
const defaultUnitValues = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, defaultWeekUnitValues = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, defaultOrdinalUnitValues = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
const orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"], orderedWeekUnits = ["weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond"], orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
function normalizeUnit(unit) {
  const normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[unit.toLowerCase()];
  if (!normalized) throw new InvalidUnitError(unit);
  return normalized;
}
function normalizeUnitWithLocalWeeks(unit) {
  switch (unit.toLowerCase()) {
    case "localweekday":
    case "localweekdays":
      return "localWeekday";
    case "localweeknumber":
    case "localweeknumbers":
      return "localWeekNumber";
    case "localweekyear":
    case "localweekyears":
      return "localWeekYear";
    default:
      return normalizeUnit(unit);
  }
}
function guessOffsetForZone(zone) {
  if (!zoneOffsetGuessCache[zone]) {
    if (zoneOffsetTs === void 0) {
      zoneOffsetTs = Settings.now();
    }
    zoneOffsetGuessCache[zone] = zone.offset(zoneOffsetTs);
  }
  return zoneOffsetGuessCache[zone];
}
function quickDT(obj, opts) {
  const zone = normalizeZone(opts.zone, Settings.defaultZone);
  if (!zone.isValid) {
    return DateTime$1.invalid(unsupportedZone(zone));
  }
  const loc = Locale.fromObject(opts);
  let ts, o;
  if (!isUndefined(obj.year)) {
    for (const u of orderedUnits) {
      if (isUndefined(obj[u])) {
        obj[u] = defaultUnitValues[u];
      }
    }
    const invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
    if (invalid) {
      return DateTime$1.invalid(invalid);
    }
    const offsetProvis = guessOffsetForZone(zone);
    [ts, o] = objToTS(obj, offsetProvis, zone);
  } else {
    ts = Settings.now();
  }
  return new DateTime$1({
    ts,
    zone,
    loc,
    o
  });
}
function diffRelative(start, end, opts) {
  const round = isUndefined(opts.round) ? true : opts.round, format = (c, unit) => {
    c = roundTo(c, round || opts.calendary ? 0 : 2, true);
    const formatter = end.loc.clone(opts).relFormatter(opts);
    return formatter.format(c, unit);
  }, differ = (unit) => {
    if (opts.calendary) {
      if (!end.hasSame(start, unit)) {
        return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
      } else return 0;
    } else {
      return end.diff(start, unit).get(unit);
    }
  };
  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }
  for (const unit of opts.units) {
    const count2 = differ(unit);
    if (Math.abs(count2) >= 1) {
      return format(count2, unit);
    }
  }
  return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
}
function lastOpts(argList) {
  let opts = {}, args;
  if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
    opts = argList[argList.length - 1];
    args = Array.from(argList).slice(0, argList.length - 1);
  } else {
    args = Array.from(argList);
  }
  return [opts, args];
}
let zoneOffsetTs;
let zoneOffsetGuessCache = {};
let DateTime$1 = class DateTime {
  /**
   * @access private
   */
  constructor(config) {
    const zone = config.zone || Settings.defaultZone;
    let invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
    this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
    let c = null, o = null;
    if (!invalid) {
      const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
      if (unchanged) {
        [c, o] = [config.old.c, config.old.o];
      } else {
        const ot = isNumber(config.o) && !config.old ? config.o : zone.offset(this.ts);
        c = tsToObj(this.ts, ot);
        invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
        c = invalid ? null : c;
        o = invalid ? null : ot;
      }
    }
    this._zone = zone;
    this.loc = config.loc || Locale.create();
    this.invalid = invalid;
    this.weekData = null;
    this.localWeekData = null;
    this.c = c;
    this.o = o;
    this.isLuxonDateTime = true;
  }
  // CONSTRUCT
  /**
   * Create a DateTime for the current instant, in the system's time zone.
   *
   * Use Settings to override these default values if needed.
   * @example DateTime.now().toISO() //~> now in the ISO format
   * @return {DateTime}
   */
  static now() {
    return new DateTime({});
  }
  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month, 1-indexed
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                                  //~> now
   * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
   * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
   * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
   * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */
  static local() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    return quickDT({
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    }, opts);
  }
  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @param {Object} options - configuration options for the DateTime
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @param {string} [options.weekSettings] - the week settings to set on the resulting DateTime instance
   * @example DateTime.utc()                                              //~> now
   * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
   * @return {DateTime}
   */
  static utc() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    opts.zone = FixedOffsetZone.utcInstance;
    return quickDT({
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    }, opts);
  }
  /**
   * Create a DateTime from a JavaScript Date object. Uses the default zone.
   * @param {Date} date - a JavaScript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  static fromJSDate(date, options = {}) {
    const ts = isDate(date) ? date.valueOf() : NaN;
    if (Number.isNaN(ts)) {
      return DateTime.invalid("invalid input");
    }
    const zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }
    return new DateTime({
      ts,
      zone: zoneToUse,
      loc: Locale.fromObject(options)
    });
  }
  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromMillis(milliseconds, options = {}) {
    if (!isNumber(milliseconds)) {
      throw new InvalidArgumentError(`fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`);
    } else if (milliseconds < -864e13 || milliseconds > MAX_DATE) {
      return DateTime.invalid("Timestamp out of range");
    } else {
      return new DateTime({
        ts: milliseconds,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromSeconds(seconds, options = {}) {
    if (!isNumber(seconds)) {
      throw new InvalidArgumentError("fromSeconds requires a numerical input");
    } else {
      return new DateTime({
        ts: seconds * 1e3,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.localWeekYear - a week year, according to the locale
   * @param {number} obj.localWeekNumber - a week number, between 1 and 52 or 53, depending on the year, according to the locale
   * @param {number} obj.localWeekday - a weekday, 1-7, where 1 is the first and 7 is the last day of the week, according to the locale
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {Object} opts - options for creating this DateTime
   * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [opts.locale='system\'s locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @example DateTime.fromObject({ localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 }, { locale: "en-US" }).toISODate() //=> '2021-12-26'
   * @return {DateTime}
   */
  static fromObject(obj, opts = {}) {
    obj = obj || {};
    const zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }
    const loc = Locale.fromObject(opts);
    const normalized = normalizeObject(obj, normalizeUnitWithLocalWeeks);
    const {
      minDaysInFirstWeek,
      startOfWeek
    } = usesLocalWeekValues(normalized, loc);
    const tsNow = Settings.now(), offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    const useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
    let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = gregorianToWeek(objNow, minDaysInFirstWeek, startOfWeek);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = gregorianToOrdinal(objNow);
    } else {
      units = orderedUnits;
      defaultValues = defaultUnitValues;
    }
    let foundFirst = false;
    for (const u of units) {
      const v = normalized[u];
      if (!isUndefined(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    }
    const higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid = higherOrderInvalid || hasInvalidTimeData(normalized);
    if (invalid) {
      return DateTime.invalid(invalid);
    }
    const gregorian = useWeekData ? weekToGregorian(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse), inst = new DateTime({
      ts: tsFinal,
      zone: zoneToUse,
      o: offsetFinal,
      loc
    });
    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return DateTime.invalid("mismatched weekday", `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`);
    }
    if (!inst.isValid) {
      return DateTime.invalid(inst.invalid);
    }
    return inst;
  }
  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @param {string} [opts.weekSettings] - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  static fromISO(text, opts = {}) {
    const [vals, parsedZone] = parseISODate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }
  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  static fromRFC2822(text, opts = {}) {
    const [vals, parsedZone] = parseRFC2822Date(text);
    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }
  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  static fromHTTP(text, opts = {}) {
    const [vals, parsedZone] = parseHTTPDate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }
  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromFormat(text, fmt, opts = {}) {
    if (isUndefined(text) || isUndefined(fmt)) {
      throw new InvalidArgumentError("fromFormat requires an input string and a format");
    }
    const {
      locale = null,
      numberingSystem = null
    } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    }), [vals, parsedZone, specificOffset, invalid] = parseFromTokens(localeToUse, text, fmt);
    if (invalid) {
      return DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
    }
  }
  /**
   * @deprecated use fromFormat instead
   */
  static fromString(text, fmt, opts = {}) {
    return DateTime.fromFormat(text, fmt, opts);
  }
  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  static fromSQL(text, opts = {}) {
    const [vals, parsedZone] = parseSQL(text);
    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }
  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent.
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidDateTimeError(invalid);
    } else {
      return new DateTime({
        invalid
      });
    }
  }
  /**
   * Check if an object is an instance of DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDateTime(o) {
    return o && o.isLuxonDateTime || false;
  }
  /**
   * Produce the format string for a set of options
   * @param formatOpts
   * @param localeOpts
   * @returns {string}
   */
  static parseFormatForOpts(formatOpts, localeOpts = {}) {
    const tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
    return !tokenList ? null : tokenList.map((t) => t ? t.val : null).join("");
  }
  /**
   * Produce the the fully expanded format token for the locale
   * Does NOT quote characters, so quoted tokens will not round trip correctly
   * @param fmt
   * @param localeOpts
   * @returns {string}
   */
  static expandFormat(fmt, localeOpts = {}) {
    const expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
    return expanded.map((t) => t.val).join("");
  }
  static resetCache() {
    zoneOffsetTs = void 0;
    zoneOffsetGuessCache = {};
  }
  // INFO
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  get(unit) {
    return this[unit];
  }
  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
   *
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
   *
   * @type {string}
   */
  get outputCalendar() {
    return this.isValid ? this.loc.outputCalendar : null;
  }
  /**
   * Get the time zone associated with this DateTime.
   * @type {Zone}
   */
  get zone() {
    return this._zone;
  }
  /**
   * Get the name of the time zone.
   * @type {string}
   */
  get zoneName() {
    return this.isValid ? this.zone.name : null;
  }
  /**
   * Get the year
   * @example DateTime.local(2017, 5, 25).year //=> 2017
   * @type {number}
   */
  get year() {
    return this.isValid ? this.c.year : NaN;
  }
  /**
   * Get the quarter
   * @example DateTime.local(2017, 5, 25).quarter //=> 2
   * @type {number}
   */
  get quarter() {
    return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
  }
  /**
   * Get the month (1-12).
   * @example DateTime.local(2017, 5, 25).month //=> 5
   * @type {number}
   */
  get month() {
    return this.isValid ? this.c.month : NaN;
  }
  /**
   * Get the day of the month (1-30ish).
   * @example DateTime.local(2017, 5, 25).day //=> 25
   * @type {number}
   */
  get day() {
    return this.isValid ? this.c.day : NaN;
  }
  /**
   * Get the hour of the day (0-23).
   * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
   * @type {number}
   */
  get hour() {
    return this.isValid ? this.c.hour : NaN;
  }
  /**
   * Get the minute of the hour (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
   * @type {number}
   */
  get minute() {
    return this.isValid ? this.c.minute : NaN;
  }
  /**
   * Get the second of the minute (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
   * @type {number}
   */
  get second() {
    return this.isValid ? this.c.second : NaN;
  }
  /**
   * Get the millisecond of the second (0-999).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
   * @type {number}
   */
  get millisecond() {
    return this.isValid ? this.c.millisecond : NaN;
  }
  /**
   * Get the week year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
   * @type {number}
   */
  get weekYear() {
    return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
  }
  /**
   * Get the week number of the week year (1-52ish).
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
   * @type {number}
   */
  get weekNumber() {
    return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
  }
  /**
   * Get the day of the week.
   * 1 is Monday and 7 is Sunday
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 11, 31).weekday //=> 4
   * @type {number}
   */
  get weekday() {
    return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
  }
  /**
   * Returns true if this date is on a weekend according to the locale, false otherwise
   * @returns {boolean}
   */
  get isWeekend() {
    return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
  }
  /**
   * Get the day of the week according to the locale.
   * 1 is the first day of the week and 7 is the last day of the week.
   * If the locale assigns Sunday as the first day of the week, then a date which is a Sunday will return 1,
   * @returns {number}
   */
  get localWeekday() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekday : NaN;
  }
  /**
   * Get the week number of the week year according to the locale. Different locales assign week numbers differently,
   * because the week can start on different days of the week (see localWeekday) and because a different number of days
   * is required for a week to count as the first week of a year.
   * @returns {number}
   */
  get localWeekNumber() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekNumber : NaN;
  }
  /**
   * Get the week year according to the locale. Different locales assign week numbers (and therefor week years)
   * differently, see localWeekNumber.
   * @returns {number}
   */
  get localWeekYear() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekYear : NaN;
  }
  /**
   * Get the ordinal (meaning the day of the year)
   * @example DateTime.local(2017, 5, 25).ordinal //=> 145
   * @type {number|DateTime}
   */
  get ordinal() {
    return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
  }
  /**
   * Get the human readable short month name, such as 'Oct'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
   * @type {string}
   */
  get monthShort() {
    return this.isValid ? Info.months("short", {
      locObj: this.loc
    })[this.month - 1] : null;
  }
  /**
   * Get the human readable long month name, such as 'October'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthLong //=> October
   * @type {string}
   */
  get monthLong() {
    return this.isValid ? Info.months("long", {
      locObj: this.loc
    })[this.month - 1] : null;
  }
  /**
   * Get the human readable short weekday, such as 'Mon'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
   * @type {string}
   */
  get weekdayShort() {
    return this.isValid ? Info.weekdays("short", {
      locObj: this.loc
    })[this.weekday - 1] : null;
  }
  /**
   * Get the human readable long weekday, such as 'Monday'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
   * @type {string}
   */
  get weekdayLong() {
    return this.isValid ? Info.weekdays("long", {
      locObj: this.loc
    })[this.weekday - 1] : null;
  }
  /**
   * Get the UTC offset of this DateTime in minutes
   * @example DateTime.now().offset //=> -240
   * @example DateTime.utc().offset //=> 0
   * @type {number}
   */
  get offset() {
    return this.isValid ? +this.o : NaN;
  }
  /**
   * Get the short human name for the zone's current offset, for example "EST" or "EDT".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameShort() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "short",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  /**
   * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameLong() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "long",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  /**
   * Get whether this zone's offset ever changes, as in a DST.
   * @type {boolean}
   */
  get isOffsetFixed() {
    return this.isValid ? this.zone.isUniversal : null;
  }
  /**
   * Get whether the DateTime is in a DST.
   * @type {boolean}
   */
  get isInDST() {
    if (this.isOffsetFixed) {
      return false;
    } else {
      return this.offset > this.set({
        month: 1,
        day: 1
      }).offset || this.offset > this.set({
        month: 5
      }).offset;
    }
  }
  /**
   * Get those DateTimes which have the same local time as this DateTime, but a different offset from UTC
   * in this DateTime's zone. During DST changes local time can be ambiguous, for example
   * `2023-10-29T02:30:00` in `Europe/Berlin` can have offset `+01:00` or `+02:00`.
   * This method will return both possible DateTimes if this DateTime's local time is ambiguous.
   * @returns {DateTime[]}
   */
  getPossibleOffsets() {
    if (!this.isValid || this.isOffsetFixed) {
      return [this];
    }
    const dayMs = 864e5;
    const minuteMs = 6e4;
    const localTS = objToLocalTS(this.c);
    const oEarlier = this.zone.offset(localTS - dayMs);
    const oLater = this.zone.offset(localTS + dayMs);
    const o1 = this.zone.offset(localTS - oEarlier * minuteMs);
    const o2 = this.zone.offset(localTS - oLater * minuteMs);
    if (o1 === o2) {
      return [this];
    }
    const ts1 = localTS - o1 * minuteMs;
    const ts2 = localTS - o2 * minuteMs;
    const c1 = tsToObj(ts1, o1);
    const c2 = tsToObj(ts2, o2);
    if (c1.hour === c2.hour && c1.minute === c2.minute && c1.second === c2.second && c1.millisecond === c2.millisecond) {
      return [clone(this, {
        ts: ts1
      }), clone(this, {
        ts: ts2
      })];
    }
    return [this];
  }
  /**
   * Returns true if this DateTime is in a leap year, false otherwise
   * @example DateTime.local(2016).isInLeapYear //=> true
   * @example DateTime.local(2013).isInLeapYear //=> false
   * @type {boolean}
   */
  get isInLeapYear() {
    return isLeapYear(this.year);
  }
  /**
   * Returns the number of days in this DateTime's month
   * @example DateTime.local(2016, 2).daysInMonth //=> 29
   * @example DateTime.local(2016, 3).daysInMonth //=> 31
   * @type {number}
   */
  get daysInMonth() {
    return daysInMonth(this.year, this.month);
  }
  /**
   * Returns the number of days in this DateTime's year
   * @example DateTime.local(2016).daysInYear //=> 366
   * @example DateTime.local(2013).daysInYear //=> 365
   * @type {number}
   */
  get daysInYear() {
    return this.isValid ? daysInYear(this.year) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2004).weeksInWeekYear //=> 53
   * @example DateTime.local(2013).weeksInWeekYear //=> 52
   * @type {number}
   */
  get weeksInWeekYear() {
    return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's local week year
   * @example DateTime.local(2020, 6, {locale: 'en-US'}).weeksInLocalWeekYear //=> 52
   * @example DateTime.local(2020, 6, {locale: 'de-DE'}).weeksInLocalWeekYear //=> 53
   * @type {number}
   */
  get weeksInLocalWeekYear() {
    return this.isValid ? weeksInWeekYear(this.localWeekYear, this.loc.getMinDaysInFirstWeek(), this.loc.getStartOfWeek()) : NaN;
  }
  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  resolvedLocaleOptions(opts = {}) {
    const {
      locale,
      numberingSystem,
      calendar
    } = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this);
    return {
      locale,
      numberingSystem,
      outputCalendar: calendar
    };
  }
  // TRANSFORM
  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link DateTime#setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  toUTC(offset2 = 0, opts = {}) {
    return this.setZone(FixedOffsetZone.instance(offset2), opts);
  }
  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.setZone(Settings.defaultZone);
  }
  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  setZone(zone, {
    keepLocalTime = false,
    keepCalendarTime = false
  } = {}) {
    zone = normalizeZone(zone, Settings.defaultZone);
    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return DateTime.invalid(unsupportedZone(zone));
    } else {
      let newTS = this.ts;
      if (keepLocalTime || keepCalendarTime) {
        const offsetGuess = zone.offset(this.ts);
        const asObj = this.toObject();
        [newTS] = objToTS(asObj, offsetGuess, zone);
      }
      return clone(this, {
        ts: newTS,
        zone
      });
    }
  }
  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  reconfigure({
    locale,
    numberingSystem,
    outputCalendar
  } = {}) {
    const loc = this.loc.clone({
      locale,
      numberingSystem,
      outputCalendar
    });
    return clone(this, {
      loc
    });
  }
  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  setLocale(locale) {
    return this.reconfigure({
      locale
    });
  }
  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
   *
   * This method also supports setting locale-based week units, i.e. `localWeekday`, `localWeekNumber` and `localWeekYear`.
   * They cannot be mixed with ISO-week units like `weekday`.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  set(values) {
    if (!this.isValid) return this;
    const normalized = normalizeObject(values, normalizeUnitWithLocalWeeks);
    const {
      minDaysInFirstWeek,
      startOfWeek
    } = usesLocalWeekValues(normalized, this.loc);
    const settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    let mixed;
    if (settingWeekStuff) {
      mixed = weekToGregorian({
        ...gregorianToWeek(this.c, minDaysInFirstWeek, startOfWeek),
        ...normalized
      }, minDaysInFirstWeek, startOfWeek);
    } else if (!isUndefined(normalized.ordinal)) {
      mixed = ordinalToGregorian({
        ...gregorianToOrdinal(this.c),
        ...normalized
      });
    } else {
      mixed = {
        ...this.toObject(),
        ...normalized
      };
      if (isUndefined(normalized.day)) {
        mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
      }
    }
    const [ts, o] = objToTS(mixed, this.o, this.zone);
    return clone(this, {
      ts,
      o
    });
  }
  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.now().plus(123) //~> in 123 milliseconds
   * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  plus(duration) {
    if (!this.isValid) return this;
    const dur = Duration.fromDurationLike(duration);
    return clone(this, adjustTime(this, dur));
  }
  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link DateTime#plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
   */
  minus(duration) {
    if (!this.isValid) return this;
    const dur = Duration.fromDurationLike(duration).negate();
    return clone(this, adjustTime(this, dur));
  }
  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  startOf(unit, {
    useLocaleWeeks = false
  } = {}) {
    if (!this.isValid) return this;
    const o = {}, normalizedUnit = Duration.normalizeUnit(unit);
    switch (normalizedUnit) {
      case "years":
        o.month = 1;
      case "quarters":
      case "months":
        o.day = 1;
      case "weeks":
      case "days":
        o.hour = 0;
      case "hours":
        o.minute = 0;
      case "minutes":
        o.second = 0;
      case "seconds":
        o.millisecond = 0;
        break;
    }
    if (normalizedUnit === "weeks") {
      if (useLocaleWeeks) {
        const startOfWeek = this.loc.getStartOfWeek();
        const {
          weekday
        } = this;
        if (weekday < startOfWeek) {
          o.weekNumber = this.weekNumber - 1;
        }
        o.weekday = startOfWeek;
      } else {
        o.weekday = 1;
      }
    }
    if (normalizedUnit === "quarters") {
      const q = Math.ceil(this.month / 3);
      o.month = (q - 1) * 3 + 1;
    }
    return this.set(o);
  }
  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  endOf(unit, opts) {
    return this.isValid ? this.plus({
      [unit]: 1
    }).startOf(unit, opts).minus(1) : this;
  }
  // OUTPUT
  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID;
  }
  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toLocaleString(); //=> 4/20/2017
   * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL, { locale: 'fr' }); //=> '28 août 2022'
   * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
   * @return {string}
   */
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID;
  }
  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.now().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  toLocaleParts(opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=false] - add the time zone format extension
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1983, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @return {string}
   */
  toISO({
    format = "extended",
    suppressSeconds = false,
    suppressMilliseconds = false,
    includeOffset = true,
    extendedZone = false
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    const ext = format === "extended";
    let c = toISODate(this, ext);
    c += "T";
    c += toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
    return c;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @return {string}
   */
  toISODate({
    format = "extended"
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, format === "extended");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=true] - add the time zone format extension
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
   * @return {string}
   */
  toISOTime({
    suppressMilliseconds = false,
    suppressSeconds = false,
    includeOffset = true,
    includePrefix = false,
    extendedZone = false,
    format = "extended"
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    let c = includePrefix ? "T" : "";
    return c + toISOTime(this, format === "extended", suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
  }
  /**
   * Returns an RFC 2822-compatible string representation of this DateTime
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string}
   */
  toSQLDate() {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, true);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  toSQLTime({
    includeOffset = true,
    includeZone = false,
    includeOffsetSpace = true
  } = {}) {
    let fmt = "HH:mm:ss.SSS";
    if (includeZone || includeOffset) {
      if (includeOffsetSpace) {
        fmt += " ";
      }
      if (includeZone) {
        fmt += "z";
      } else if (includeOffset) {
        fmt += "ZZ";
      }
    }
    return toTechFormat(this, fmt, true);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  toSQL(opts = {}) {
    if (!this.isValid) {
      return null;
    }
    return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
  }
  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  toString() {
    return this.isValid ? this.toISO() : INVALID;
  }
  /**
   * Returns a string representation of this DateTime appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`;
    } else {
      return `DateTime { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  /**
   * Returns the epoch seconds of this DateTime.
   * @return {number}
   */
  toSeconds() {
    return this.isValid ? this.ts / 1e3 : NaN;
  }
  /**
   * Returns the epoch seconds (as a whole number) of this DateTime.
   * @return {number}
   */
  toUnixInteger() {
    return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
  }
  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  toBSON() {
    return this.toJSDate();
  }
  /**
   * Returns a JavaScript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  toObject(opts = {}) {
    if (!this.isValid) return {};
    const base = {
      ...this.c
    };
    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }
    return base;
  }
  /**
   * Returns a JavaScript Date equivalent to this DateTime.
   * @return {Date}
   */
  toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  }
  // COMPARE
  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  diff(otherDateTime, unit = "milliseconds", opts = {}) {
    if (!this.isValid || !otherDateTime.isValid) {
      return Duration.invalid("created by diffing an invalid DateTime");
    }
    const durOpts = {
      locale: this.locale,
      numberingSystem: this.numberingSystem,
      ...opts
    };
    const units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = diff(earlier, later, units, durOpts);
    return otherIsLater ? diffed.negate() : diffed;
  }
  /**
   * Return the difference between this DateTime and right now.
   * See {@link DateTime#diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  diffNow(unit = "milliseconds", opts = {}) {
    return this.diff(DateTime.now(), unit, opts);
  }
  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval}
   */
  until(otherDateTime) {
    return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
  }
  /**
   * Return whether this DateTime is in the same unit of time as another DateTime.
   * Higher-order units must also be identical for this function to return `true`.
   * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; only the locale of this DateTime is used
   * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
   * @return {boolean}
   */
  hasSame(otherDateTime, unit, opts) {
    if (!this.isValid) return false;
    const inputMs = otherDateTime.valueOf();
    const adjustedToZone = this.setZone(otherDateTime.zone, {
      keepLocalTime: true
    });
    return adjustedToZone.startOf(unit, opts) <= inputMs && inputMs <= adjustedToZone.endOf(unit, opts);
  }
  /**
   * Equality check
   * Two DateTimes are equal if and only if they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  equals(other) {
    return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
  }
  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds down by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  toRelative(options = {}) {
    if (!this.isValid) return null;
    const base = options.base || DateTime.fromObject({}, {
      zone: this.zone
    }), padding2 = options.padding ? this < base ? -options.padding : options.padding : 0;
    let units = ["years", "months", "days", "hours", "minutes", "seconds"];
    let unit = options.unit;
    if (Array.isArray(options.unit)) {
      units = options.unit;
      unit = void 0;
    }
    return diffRelative(base, this.plus(padding2), {
      ...options,
      numeric: "always",
      units,
      unit
    });
  }
  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  toRelativeCalendar(options = {}) {
    if (!this.isValid) return null;
    return diffRelative(options.base || DateTime.fromObject({}, {
      zone: this.zone
    }), this, {
      ...options,
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true
    });
  }
  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  static min(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("min requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i) => i.valueOf(), Math.min);
  }
  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  static max(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("max requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i) => i.valueOf(), Math.max);
  }
  // MISC
  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  static fromFormatExplain(text, fmt, options = {}) {
    const {
      locale = null,
      numberingSystem = null
    } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return explainFromTokens(localeToUse, text, fmt);
  }
  /**
   * @deprecated use fromFormatExplain instead
   */
  static fromStringExplain(text, fmt, options = {}) {
    return DateTime.fromFormatExplain(text, fmt, options);
  }
  /**
   * Build a parser for `fmt` using the given locale. This parser can be passed
   * to {@link DateTime.fromFormatParser} to a parse a date in this format. This
   * can be used to optimize cases where many dates need to be parsed in a
   * specific format.
   *
   * @param {String} fmt - the format the string is expected to be in (see
   * description)
   * @param {Object} options - options used to set locale and numberingSystem
   * for parser
   * @returns {TokenParser} - opaque object to be used
   */
  static buildFormatParser(fmt, options = {}) {
    const {
      locale = null,
      numberingSystem = null
    } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return new TokenParser(localeToUse, fmt);
  }
  /**
   * Create a DateTime from an input string and format parser.
   *
   * The format parser must have been created with the same locale as this call.
   *
   * @param {String} text - the string to parse
   * @param {TokenParser} formatParser - parser from {@link DateTime.buildFormatParser}
   * @param {Object} opts - options taken by fromFormat()
   * @returns {DateTime}
   */
  static fromFormatParser(text, formatParser, opts = {}) {
    if (isUndefined(text) || isUndefined(formatParser)) {
      throw new InvalidArgumentError("fromFormatParser requires an input string and a format parser");
    }
    const {
      locale = null,
      numberingSystem = null
    } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    if (!localeToUse.equals(formatParser.locale)) {
      throw new InvalidArgumentError(`fromFormatParser called with a locale of ${localeToUse}, but the format parser was created for ${formatParser.locale}`);
    }
    const {
      result,
      zone,
      specificOffset,
      invalidReason
    } = formatParser.explainFromTokens(text);
    if (invalidReason) {
      return DateTime.invalid(invalidReason);
    } else {
      return parseDataToDateTime(result, zone, opts, `format ${formatParser.format}`, text, specificOffset);
    }
  }
  // FORMAT PRESETS
  /**
   * {@link DateTime#toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  static get DATE_SHORT() {
    return DATE_SHORT;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED() {
    return DATE_MED;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED_WITH_WEEKDAY() {
    return DATE_MED_WITH_WEEKDAY;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983'
   * @type {Object}
   */
  static get DATE_FULL() {
    return DATE_FULL;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
   * @type {Object}
   */
  static get DATE_HUGE() {
    return DATE_HUGE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_SIMPLE() {
    return TIME_SIMPLE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SECONDS() {
    return TIME_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SHORT_OFFSET() {
    return TIME_WITH_SHORT_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_LONG_OFFSET() {
    return TIME_WITH_LONG_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_SIMPLE() {
    return TIME_24_SIMPLE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SECONDS() {
    return TIME_24_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SHORT_OFFSET() {
    return TIME_24_WITH_SHORT_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_LONG_OFFSET() {
    return TIME_24_WITH_LONG_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT() {
    return DATETIME_SHORT;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT_WITH_SECONDS() {
    return DATETIME_SHORT_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED() {
    return DATETIME_MED;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_SECONDS() {
    return DATETIME_MED_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_WEEKDAY() {
    return DATETIME_MED_WITH_WEEKDAY;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL() {
    return DATETIME_FULL;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL_WITH_SECONDS() {
    return DATETIME_FULL_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE() {
    return DATETIME_HUGE;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE_WITH_SECONDS() {
    return DATETIME_HUGE_WITH_SECONDS;
  }
};
function friendlyDateTime(dateTimeish) {
  if (DateTime$1.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
    return DateTime$1.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime$1.fromObject(dateTimeish);
  } else {
    throw new InvalidArgumentError(`Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`);
  }
}
const VERSION = "3.5.0";
luxon.DateTime = DateTime$1;
luxon.Duration = Duration;
luxon.FixedOffsetZone = FixedOffsetZone;
luxon.IANAZone = IANAZone;
luxon.Info = Info;
luxon.Interval = Interval;
luxon.InvalidZone = InvalidZone;
luxon.Settings = Settings;
luxon.SystemZone = SystemZone;
luxon.VERSION = VERSION;
luxon.Zone = Zone;
var DateTime2 = {};
var ExifDateTime = {};
var Maybe = {};
Object.defineProperty(Maybe, "__esModule", { value: true });
Maybe.map = map;
Maybe.map2 = map2;
Maybe.first = first;
Maybe.firstDefinedThunk = firstDefinedThunk;
Maybe.denull = denull;
function map(maybeT, f) {
  return maybeT == null ? void 0 : f(maybeT);
}
function map2(a, b, f) {
  return a == null || b == null ? void 0 : f(a, b);
}
function first(iter, f) {
  for (const t of iter) {
    if (t != null) {
      const v = f(t);
      if (v != null)
        return v;
    }
  }
  return;
}
function firstDefinedThunk(iter) {
  for (const f of iter) {
    const result = f();
    if (result != null)
      return result;
  }
  return;
}
function denull(t) {
  return t == null ? void 0 : t;
}
var TimeParsing = {};
var Timezones = {};
var ExifTime = {};
var hasRequiredExifTime;
function requireExifTime() {
  var _dt, _z, _ExifTime_instances, subsec_fn, shortZone_fn, _a2;
  if (hasRequiredExifTime) return ExifTime;
  hasRequiredExifTime = 1;
  Object.defineProperty(ExifTime, "__esModule", { value: true });
  ExifTime.ExifTime = void 0;
  const luxon_1 = luxon;
  const DateTime_12 = requireDateTime();
  const String_12 = _String;
  const TimeParsing_1 = requireTimeParsing();
  const Timezones_1 = requireTimezones();
  let ExifTime$1 = (_a2 = class {
    constructor(hour, minute, second, millisecond, rawValue, zoneName, inferredZone) {
      __privateAdd(this, _ExifTime_instances);
      __publicField(this, "hour");
      __publicField(this, "minute");
      __publicField(this, "second");
      __publicField(this, "millisecond");
      __publicField(this, "rawValue");
      __publicField(this, "inferredZone");
      __privateAdd(this, _dt);
      __privateAdd(this, _z);
      __publicField(this, "zone");
      this.hour = hour;
      this.minute = minute;
      this.second = second;
      this.millisecond = millisecond;
      this.rawValue = rawValue;
      this.inferredZone = inferredZone;
      this.zone = (0, Timezones_1.getZoneName)({ zoneName });
    }
    static fromEXIF(text, defaultZone2) {
      const s2 = (0, String_12.toS)(text).trim();
      if (s2.length === 0)
        return;
      const result = (0, TimeParsing_1.parseDateTime)(text, (0, TimeParsing_1.timeFormats)({ defaultZone: defaultZone2 }));
      if (result != null) {
        return this.fromDateTime(result.dt, text, result.unsetZone ? void 0 : (0, Timezones_1.getZoneName)({ zone: result.dt.zone }), result.inferredZone, result.unsetMilliseconds);
      }
      return;
    }
    static fromDateTime(dt, rawValue, zone, inferredZone, unsetMilliseconds) {
      return !(0, DateTime_12.validDateTime)(dt) ? void 0 : new _a2(dt.hour, dt.minute, dt.second, unsetMilliseconds ? void 0 : dt.millisecond, rawValue, zone, inferredZone);
    }
    toDateTime() {
      return __privateGet(this, _dt) ?? __privateSet(this, _dt, luxon_1.DateTime.fromObject({
        hour: this.hour,
        minute: this.minute,
        second: this.second,
        millisecond: this.millisecond
      }, {
        zone: this.zone
      }));
    }
    /**
     * Alias for `.millisecond`
     */
    get millis() {
      return this.millisecond;
    }
    get hasZone() {
      return this.zone != null;
    }
    toString() {
      return (0, String_12.pad2)(this.hour, this.minute, this.second).join(":") + __privateMethod(this, _ExifTime_instances, subsec_fn).call(this) + __privateMethod(this, _ExifTime_instances, shortZone_fn).call(this);
    }
    toISOString() {
      return this.toString();
    }
    toExifString() {
      return this.toString();
    }
    setZone(zone, opts) {
      const dt = (0, TimeParsing_1.setZone)({
        zone,
        src: this.toDateTime(),
        srcHasZone: this.hasZone,
        opts
      });
      return _a2.fromDateTime(dt, this.rawValue, this.zone, this.inferredZone, this.millisecond == null);
    }
    toJSON() {
      return {
        _ctor: "ExifTime",
        hour: this.hour,
        minute: this.minute,
        second: this.second,
        millisecond: this.millisecond,
        rawValue: this.rawValue,
        zone: this.zone,
        inferredZone: this.inferredZone
      };
    }
    static fromJSON(json) {
      return new _a2(json.hour, json.minute, json.second, json.millisecond, json.rawValue, json.zone, json.inferredZone);
    }
  }, _dt = new WeakMap(), _z = new WeakMap(), _ExifTime_instances = new WeakSet(), subsec_fn = function() {
    return this.millisecond == null ? "" : "." + (0, String_12.pad3)(this.millisecond);
  }, shortZone_fn = function() {
    return __privateGet(this, _z) ?? __privateSet(this, _z, (0, Timezones_1.zoneToShortOffset)(this.zone));
  }, _a2);
  ExifTime.ExifTime = ExifTime$1;
  return ExifTime;
}
var hasRequiredTimezones;
function requireTimezones() {
  if (hasRequiredTimezones) return Timezones;
  hasRequiredTimezones = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TimezoneOffsetTagnames = exports2.defaultVideosToUTC = exports2.UnsetZoneName = exports2.UnsetZone = exports2.UnsetZoneOffsetMinutes = void 0;
    exports2.isUTC = isUTC;
    exports2.isZoneValid = isZoneValid;
    exports2.normalizeZone = normalizeZone2;
    exports2.zoneToShortOffset = zoneToShortOffset;
    exports2.validTzOffsetMinutes = validTzOffsetMinutes;
    exports2.offsetMinutesToZoneName = offsetMinutesToZoneName;
    exports2.extractZone = extractZone;
    exports2.incrementZone = incrementZone;
    exports2.extractTzOffsetFromTags = extractTzOffsetFromTags;
    exports2.extractTzOffsetFromDatestamps = extractTzOffsetFromDatestamps;
    exports2.extractTzOffsetFromTimeStamp = extractTzOffsetFromTimeStamp;
    exports2.inferLikelyOffsetMinutes = inferLikelyOffsetMinutes;
    exports2.extractTzOffsetFromUTCOffset = extractTzOffsetFromUTCOffset;
    exports2.equivalentZones = equivalentZones;
    exports2.getZoneName = getZoneName;
    const luxon_1 = luxon;
    const Array_12 = _Array;
    const BinaryField_12 = BinaryField$1;
    const CapturedAtTagNames_1 = CapturedAtTagNames;
    const DefaultExifToolOptions_1 = DefaultExifToolOptions;
    const ExifDate_12 = requireExifDate();
    const ExifDateTime_12 = requireExifDateTime();
    const ExifTime_12 = requireExifTime();
    const Lazy_12 = Lazy;
    const Maybe_1 = Maybe;
    const Number_12 = _Number;
    const Pick_12 = Pick;
    const String_12 = _String;
    const ValidTimezoneOffsets = [
      // "-12:00", // not used for any populated land
      "-11:00",
      // "-10:30", // used by Hawaii 1896-1947
      "-10:00",
      "-09:30",
      "-09:00",
      "-08:30",
      "-08:00",
      "-07:00",
      "-06:00",
      "-05:00",
      "-04:30",
      // used by Venezuela 1912-1965 and 2007-2016
      "-04:00",
      "-03:30",
      "-03:00",
      "-02:30",
      "-02:00",
      "-01:00",
      // "-00:44", // used by Liberia until 1972
      // "-00:25:21", // Ireland 1880-1916 https://en.wikipedia.org/wiki/UTC%E2%88%9200:25:21
      "+00:00",
      // "+00:20", // used by Netherlands until 1940
      // "+00:30", // used by Switzerland until 1936
      "+01:00",
      // "+01:24", // used by Warsaw until 1915
      // "+01:30", // used by some southern African countries until 1903
      "+02:00",
      // "+02:30", // archaic Moscow time
      "+03:00",
      "+03:30",
      "+04:00",
      "+04:30",
      // "+04:51", // used by Bombay until 1955 https://en.wikipedia.org/wiki/UTC%2B04:51
      "+05:00",
      "+05:30",
      // "+05:40", // used by Nepal until 1920
      "+05:45",
      // Nepal
      "+06:00",
      "+06:30",
      "+07:00",
      // "+07:20", // used by Singapore and Malaya until 1941
      "+07:30",
      // used by Mayasia until 1982
      "+08:00",
      "+08:30",
      // used by North Korea until 2018
      "+08:45",
      // used by Western Australia, but not in tz database
      "+09:00",
      "+09:30",
      "+09:45",
      // used by Western Australia, but not in tz database
      "+10:00",
      "+10:30",
      "+11:00",
      "+12:00",
      "+12:45",
      // New Zealand islands
      "+13:00",
      // New Zealand and Antarctica
      "+13:45",
      // New Zealand islands
      "+14:00"
    ];
    function offsetToMinutes(offset2) {
      const [h, m] = offset2.split(":").map(Number);
      const sign = h < 0 ? -1 : 1;
      return h * 60 + sign * m;
    }
    const ValidOffsetMinutes = (0, Lazy_12.lazy)(() => new Set(ValidTimezoneOffsets.map(offsetToMinutes)));
    exports2.UnsetZoneOffsetMinutes = -1;
    exports2.UnsetZone = luxon_1.Info.normalizeZone(exports2.UnsetZoneOffsetMinutes);
    exports2.UnsetZoneName = exports2.UnsetZone.name;
    const Zulus = [
      luxon_1.FixedOffsetZone.utcInstance,
      0,
      -0,
      "UTC",
      "GMT",
      "Z",
      "+0",
      "+00:00",
      "UTC+0",
      "GMT+0",
      "UTC+00:00"
      // ...sigh, so much for "normalizeZone"...
    ];
    function isUTC(zone) {
      const z = zone;
      return zone != null && (Zulus.includes(z) || Zulus.includes(z.zoneName ?? z.fixed));
    }
    function isZoneValid(zone) {
      return zone != null && zone.isValid && Math.abs(zone.offset(Date.now())) < 14 * 60;
    }
    exports2.defaultVideosToUTC = "defaultVideosToUTC";
    const IanaFormatRE = /^\w{2,15}(?:\/\w{3,15}){0,2}$/;
    const FixedFormatRE = /^UTC[+-]\d{1,2}(?::\d\d)?$/;
    function normalizeZone2(input) {
      try {
        if ((0, String_12.blank)(input))
          return void 0;
        if (input instanceof luxon_1.Zone) {
          return isZoneValid(input) ? input : void 0;
        }
        if (isUTC(input))
          return luxon_1.FixedOffsetZone.utcInstance;
        let z = input;
        if (typeof z === "string") {
          z = z.replace(/^(?:Zulu|Z|GMT)(?:\b|$)/, "UTC");
          if ((0, String_12.blank)(z) || !IanaFormatRE.test(z) && !FixedFormatRE.test(z)) {
            return;
          }
        }
        const result = luxon_1.Info.normalizeZone(z);
        return isZoneValid(result) && result.name !== exports2.UnsetZoneName ? result : void 0;
      } catch {
        return;
      }
    }
    function zoneToShortOffset(zone, ts) {
      var _a2;
      return ((_a2 = normalizeZone2(zone)) == null ? void 0 : _a2.formatOffset(ts ?? Date.now(), "short")) ?? "";
    }
    function validTzOffsetMinutes(tzOffsetMinutes) {
      return tzOffsetMinutes != null && (0, Number_12.isNumber)(tzOffsetMinutes) && tzOffsetMinutes !== exports2.UnsetZoneOffsetMinutes && ValidOffsetMinutes().has(tzOffsetMinutes);
    }
    function offsetMinutesToZoneName(offsetMinutes) {
      if (!validTzOffsetMinutes(offsetMinutes)) {
        return void 0;
      }
      if (offsetMinutes === 0)
        return "UTC";
      const sign = offsetMinutes < 0 ? "-" : "+";
      const absMinutes = Math.abs(offsetMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = Math.abs(absMinutes % 60);
      return `UTC${sign}` + hours + (minutes === 0 ? "" : `:${(0, String_12.pad2)(minutes)}`);
    }
    function tzHourToOffset(n2) {
      return (0, Number_12.isNumber)(n2) && validTzOffsetMinutes(n2 * 60) ? offsetMinutesToZoneName(n2 * 60) : void 0;
    }
    const tzRe = /(?<Z>Z)|((UTC)?(?<sign>[+-])(?<hours>\d\d?)(?::(?<minutes>\d\d))?)$/;
    function extractOffsetFromHours(hourOffset) {
      return (0, Number_12.isNumber)(hourOffset) ? (0, Maybe_1.map)(tzHourToOffset(hourOffset), (tz2) => ({
        tz: tz2,
        src: "hourOffset"
      })) : Array.isArray(hourOffset) ? extractOffsetFromHours(hourOffset[0]) : void 0;
    }
    function extractZone(value, opts) {
      if (value == null || typeof value === "boolean" || value instanceof BinaryField_12.BinaryField || value instanceof ExifDate_12.ExifDate) {
        return;
      }
      if (Array.isArray(value)) {
        return extractZone(value.find((ea) => ea != null));
      }
      if (value instanceof ExifDateTime_12.ExifDateTime || value instanceof ExifTime_12.ExifTime) {
        return value.zone == null ? void 0 : { tz: value.zone, src: value.constructor.name + ".zone" };
      }
      if ((0, Number_12.isNumber)(value)) {
        return extractOffsetFromHours(value);
      }
      if (typeof value !== "string" || (0, String_12.blank)(value)) {
        return;
      }
      {
        const z = normalizeZone2(value);
        if (z != null) {
          return { tz: z.name, src: "normalizeZone" };
        }
      }
      let str = value.trim();
      if ((opts == null ? void 0 : opts.stripTZA) !== false && // We only want to strip off the TZA if the input _doesn't_ end with "UTC"
      // or "Z"
      !/[.\d\s](?:UTC|Z)$/.test(str)) {
        str = str.replace(/\s[a-z]{2,5}$/i, "");
      }
      {
        if ((0, String_12.blank)(str))
          return;
        const z = normalizeZone2(str);
        if (z != null) {
          return { tz: z.name, src: "normalizeZone" };
        }
      }
      const match2 = tzRe.exec(str);
      const capturedGroups = match2 == null ? void 0 : match2.groups;
      if (match2 != null && capturedGroups != null) {
        const leftovers = str.slice(0, match2.index);
        if (capturedGroups.Z === "Z")
          return {
            tz: "UTC",
            src: "Z",
            leftovers
          };
        const offsetMinutes = (capturedGroups.sign === "-" ? -1 : 1) * (parseInt(capturedGroups.hours ?? "0") * 60 + parseInt(capturedGroups.minutes ?? "0"));
        const tz2 = offsetMinutesToZoneName(offsetMinutes);
        if (tz2 != null) {
          return { tz: tz2, src: "offsetMinutesToZoneName", leftovers };
        }
      }
      return;
    }
    exports2.TimezoneOffsetTagnames = [
      "TimeZone",
      "OffsetTime",
      // time zone for DateTimeOriginal, "-08:00"
      "OffsetTimeOriginal",
      // time zone for CreateDate, "-08:00"
      "OffsetTimeDigitized",
      // srsly who came up with these wholly inconsistent tag names? _why not just
      // prefix tag names with "Offset"?!11_ SADNESS AND WOE
      // 1 or 2 values: 1. The time zone offset of DateTimeOriginal from GMT in
      // hours, 2. If present, the time zone offset of ModifyDate (which we
      // ignore) @see https://www.exiftool.org/TagNames/EXIF.html
      "TimeZoneOffset"
      // number | number[] | string
      // We DON'T use "GeolocationTimezone" here, as at this layer in the glue
      // factory we don't have access to the ExifTool option "ignoreZeroZeroLatLon"
    ];
    function incrementZone(z, minutes) {
      const norm = normalizeZone2(z);
      if (norm == null || true !== norm.isUniversal)
        return;
      const fixed = norm.offset(Date.now());
      return (0, Number_12.isNumber)(fixed) ? luxon_1.FixedOffsetZone.instance(fixed + minutes) : void 0;
    }
    function extractTzOffsetFromTags(t, opts) {
      const adjustFn = (opts == null ? void 0 : opts.adjustTimeZoneIfDaylightSavings) ?? DefaultExifToolOptions_1.defaultAdjustTimeZoneIfDaylightSavings;
      for (const tagName of exports2.TimezoneOffsetTagnames) {
        const offset2 = extractZone(t[tagName]);
        if (offset2 == null)
          continue;
        const minutes = adjustFn(t, offset2.tz);
        if (minutes != null) {
          const adjustedZone = incrementZone(offset2.tz, minutes);
          if (adjustedZone != null)
            return {
              tz: adjustedZone.name,
              src: tagName + " (adjusted for DaylightSavings)"
            };
        }
        return { tz: offset2.tz, src: tagName };
      }
      return;
    }
    function extractTzOffsetFromDatestamps(t, opts) {
      if ((opts == null ? void 0 : opts.inferTimezoneFromDatestamps) === true) {
        for (const tagName of opts.inferTimezoneFromDatestampTags ?? []) {
          if (t[tagName] != null) {
            const offset2 = extractZone(t[tagName]);
            if (offset2 != null && !isUTC(offset2.tz)) {
              return { tz: offset2.tz, src: tagName };
            }
          }
        }
      }
      return;
    }
    function extractTzOffsetFromTimeStamp(t, opts) {
      if ((opts == null ? void 0 : opts.inferTimezoneFromTimeStamp) !== true)
        return;
      const ts = ExifDateTime_12.ExifDateTime.from(t.TimeStamp);
      if (ts == null)
        return;
      for (const tagName of opts.inferTimezoneFromDatestampTags ?? []) {
        const ea = ExifDateTime_12.ExifDateTime.from(t[tagName]);
        if (ea == null)
          continue;
        if (ea.zone != null) {
          return { tz: ea.zone, src: tagName };
        }
        const deltaMinutes = Math.floor((ea.toEpochSeconds("UTC") - ts.toEpochSeconds()) / 60);
        const likelyOffsetZone = inferLikelyOffsetMinutes(deltaMinutes);
        const tz2 = offsetMinutesToZoneName(likelyOffsetZone);
        if (tz2 != null) {
          return { tz: tz2, src: "offset between " + tagName + " and TimeStamp" };
        }
      }
      return;
    }
    const LikelyOffsetMinutes = ValidTimezoneOffsets.map(offsetToMinutes);
    function inferLikelyOffsetMinutes(deltaMinutes) {
      const nearest = (0, Array_12.leastBy)(LikelyOffsetMinutes, (ea) => Math.abs(ea - deltaMinutes));
      return Math.abs(nearest - deltaMinutes) < 30 ? nearest : void 0;
    }
    function blankToNull(x) {
      return x == null || typeof x === "string" && (0, String_12.blank)(x) ? void 0 : x;
    }
    function extractTzOffsetFromUTCOffset(t) {
      const utcSources = {
        ...(0, Pick_12.pick)(t, "GPSDateTime", "DateTimeUTC", "SonyDateTime2"),
        GPSDateTimeStamp: (0, Maybe_1.map2)(
          blankToNull(t.GPSDateStamp),
          // Example: "2022:04:13"
          blankToNull(t.GPSTimeStamp),
          // Example: "23:59:41.001"
          (a, b) => a + " " + b
        )
      };
      const utc = (0, Maybe_1.first)([
        "GPSDateTime",
        "DateTimeUTC",
        "GPSDateTimeStamp",
        "SonyDateTime2"
      ], (tagName) => {
        var _a2;
        const v = utcSources[tagName];
        const edt = v instanceof ExifDateTime_12.ExifDateTime ? v : ExifDateTime_12.ExifDateTime.fromExifStrict(v);
        const s2 = edt != null && (edt.zone == null || isUTC(edt.zone)) ? (_a2 = edt.setZone("UTC", { keepLocalTime: true })) == null ? void 0 : _a2.toEpochSeconds() : void 0;
        return s2 != null ? {
          tagName,
          s: s2
        } : void 0;
      });
      if (utc == null)
        return;
      const dt = (0, Maybe_1.first)(CapturedAtTagNames_1.CapturedAtTagNames, (tagName) => {
        var _a2;
        const edt = ExifDateTime_12.ExifDateTime.fromExifStrict(t[tagName]);
        const s2 = edt != null && edt.zone == null ? (_a2 = edt.setZone("UTC", { keepLocalTime: true })) == null ? void 0 : _a2.toEpochSeconds() : void 0;
        return s2 != null ? {
          tagName,
          s: s2
        } : void 0;
      });
      if (dt == null)
        return;
      const diffSeconds = dt.s - utc.s;
      const offsetMinutes = inferLikelyOffsetMinutes(diffSeconds / 60);
      return (0, Maybe_1.map)(offsetMinutesToZoneName(offsetMinutes), (tz2) => ({
        tz: tz2,
        src: `offset between ${dt.tagName} and ${utc.tagName}`
      }));
    }
    function equivalentZones(a, b) {
      const az = normalizeZone2(a);
      const bz = normalizeZone2(b);
      return az != null && bz != null && (az.equals(bz) || az.offset(Date.now()) === bz.offset(Date.now()));
    }
    function getZoneName(args = {}) {
      var _a2, _b;
      const result = ((_a2 = normalizeZone2(args.zone)) == null ? void 0 : _a2.name) ?? ((_b = normalizeZone2(args.zoneName)) == null ? void 0 : _b.name) ?? offsetMinutesToZoneName(args.tzoffsetMinutes);
      return (0, String_12.blank)(result) || result === exports2.UnsetZoneName ? void 0 : result;
    }
  })(Timezones);
  return Timezones;
}
var hasRequiredTimeParsing;
function requireTimeParsing() {
  if (hasRequiredTimeParsing) return TimeParsing;
  hasRequiredTimeParsing = 1;
  Object.defineProperty(TimeParsing, "__esModule", { value: true });
  TimeParsing.timeFormats = timeFormats;
  TimeParsing.parseDateTime = parseDateTime;
  TimeParsing.setZone = setZone;
  const luxon_1 = luxon;
  const String_12 = _String;
  const Timezones_1 = requireTimezones();
  const TimeFmts = [
    // I haven't seen times without padded hours, minutes, or seconds in the
    // wild (yet), so those aren't handled here:
    { fmt: "HH:mm:ss.u", unsetMilliseconds: false },
    { fmt: "HH:mm:ss", unsetMilliseconds: true },
    { fmt: "HH:mm", unsetMilliseconds: true }
  ];
  function* timeFormats(args) {
    const inferredZone = (0, String_12.notBlank)(args.defaultZone);
    for (const prefix of args.formatPrefixes ?? [""]) {
      for (const timeFmt of TimeFmts) {
        yield {
          fmt: prefix + timeFmt.fmt,
          zone: args.defaultZone,
          unsetMilliseconds: timeFmt.unsetMilliseconds,
          inferredZone
        };
      }
    }
  }
  function parseDateTime(text, fmts) {
    const s2 = (0, String_12.toS)(text).trim();
    if (s2.length === 0)
      return;
    const extractedZone = (0, Timezones_1.extractZone)(s2);
    const input = (extractedZone == null ? void 0 : extractedZone.leftovers) ?? s2;
    for (const ea of fmts) {
      const dt = luxon_1.DateTime.fromFormat(input, ea.fmt, {
        setZone: true,
        zone: (extractedZone == null ? void 0 : extractedZone.tz) ?? ea.zone ?? Timezones_1.UnsetZone
      });
      if (dt == null || !dt.isValid)
        continue;
      const unsetZone = (extractedZone == null ? void 0 : extractedZone.tz) == null && (dt.zone == null || dt.zone === Timezones_1.UnsetZone);
      let inferredZone = (extractedZone == null ? void 0 : extractedZone.tz) != null || unsetZone ? false : ea.inferredZone;
      if (inferredZone == null) {
        const dt2 = luxon_1.DateTime.fromFormat(input, ea.fmt, { setZone: true });
        inferredZone = dt.zone !== dt2.zone;
      }
      return {
        dt,
        fmt: ea.fmt,
        unsetZone,
        inferredZone,
        input,
        unsetMilliseconds: ea.unsetMilliseconds ?? false
      };
    }
    return;
  }
  function setZone(args) {
    return args.src.setZone(args.zone, {
      keepLocalTime: !args.srcHasZone,
      ...args.opts
    });
  }
  return TimeParsing;
}
var hasRequiredExifDateTime;
function requireExifDateTime() {
  var _ExifDateTime_static, _a2, fromPatterns_fn, looseExifFormats_fn, _dt;
  if (hasRequiredExifDateTime) return ExifDateTime;
  hasRequiredExifDateTime = 1;
  Object.defineProperty(ExifDateTime, "__esModule", { value: true });
  ExifDateTime.ExifDateTime = void 0;
  const luxon_1 = luxon;
  const DateTime_12 = requireDateTime();
  const Maybe_1 = Maybe;
  const Object_12 = _Object;
  const String_12 = _String;
  const TimeParsing_1 = requireTimeParsing();
  const Timezones_1 = requireTimezones();
  let ExifDateTime$1 = (_a2 = class {
    constructor(year, month, day, hour, minute, second, millisecond, tzoffsetMinutes, rawValue, zoneName, inferredZone) {
      __publicField(this, "year");
      __publicField(this, "month");
      __publicField(this, "day");
      __publicField(this, "hour");
      __publicField(this, "minute");
      __publicField(this, "second");
      __publicField(this, "millisecond");
      __publicField(this, "tzoffsetMinutes");
      __publicField(this, "rawValue");
      __publicField(this, "zoneName");
      __publicField(this, "inferredZone");
      __privateAdd(this, _dt);
      __publicField(this, "zone");
      this.year = year;
      this.month = month;
      this.day = day;
      this.hour = hour;
      this.minute = minute;
      this.second = second;
      this.millisecond = millisecond;
      this.tzoffsetMinutes = tzoffsetMinutes;
      this.rawValue = rawValue;
      this.zoneName = zoneName;
      this.inferredZone = inferredZone;
      this.zone = (0, Timezones_1.getZoneName)({ zoneName, tzoffsetMinutes });
    }
    static from(exifOrIso, defaultZone2) {
      return exifOrIso instanceof _a2 ? exifOrIso : (0, String_12.blank)(exifOrIso) ? void 0 : this.fromExifStrict(exifOrIso, defaultZone2) ?? this.fromISO(exifOrIso, defaultZone2) ?? this.fromExifLoose(exifOrIso, defaultZone2);
    }
    static fromISO(iso, defaultZone2) {
      if ((0, String_12.blank)(iso) || null != iso.match(/^\d+$/))
        return void 0;
      return __privateMethod(this, _ExifDateTime_static, fromPatterns_fn).call(this, iso, (0, TimeParsing_1.timeFormats)({
        formatPrefixes: ["y-MM-dd'T'", "y-MM-dd ", "y-M-d "],
        defaultZone: defaultZone2
      }));
    }
    /**
     * Try to parse a date-time string from EXIF. If there is not both a date
     * and a time component, returns `undefined`.
     *
     * @param text from EXIF metadata
     * @param defaultZone a "zone name" to use as a backstop, or default, if
     * `text` doesn't specify a zone. This may be IANA-formatted, like
     * "America/Los_Angeles", or an offset, like "UTC-3". See
     * `offsetMinutesToZoneName`.
     */
    static fromEXIF(text, defaultZone2) {
      if ((0, String_12.blank)(text))
        return void 0;
      return (
        // .fromExifStrict() uses .fromISO() as a backstop
        this.fromExifStrict(text, defaultZone2) ?? this.fromExifLoose(text, defaultZone2)
      );
    }
    /**
       * Parse the given date-time string, EXIF-formatted.
       *
       * @param text from EXIF metadata, in `y:M:d H:m:s` format (with optional
       * sub-seconds and/or timezone)
    
       * @param defaultZone a "zone name" to use as a backstop, or default, if
       * `text` doesn't specify a zone. This may be IANA-formatted, like
       * "America/Los_Angeles", or an offset, like "UTC-3". See
       * `offsetMinutesToZoneName`.
       */
    static fromExifStrict(text, defaultZone2) {
      if ((0, String_12.blank)(text))
        return void 0;
      return __privateMethod(this, _ExifDateTime_static, fromPatterns_fn).call(this, text, (0, TimeParsing_1.timeFormats)({ formatPrefixes: ["y:MM:dd ", "y:M:d "], defaultZone: defaultZone2 })) ?? // Not found yet? Maybe it's in ISO format? See
      // https://github.com/photostructure/exiftool-vendored.js/issues/71
      this.fromISO(text, defaultZone2);
    }
    static fromExifLoose(text, defaultZone2) {
      return (0, String_12.blank)(text) ? void 0 : __privateMethod(this, _ExifDateTime_static, fromPatterns_fn).call(this, text, __privateMethod(this, _ExifDateTime_static, looseExifFormats_fn).call(this, defaultZone2));
    }
    static fromDateTime(dt, opts) {
      var _a3;
      if (dt == null || !dt.isValid || dt.year === 0 || dt.year === 1) {
        return void 0;
      }
      return new _a2(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.millisecond === 0 && true === (opts == null ? void 0 : opts.unsetMilliseconds) ? void 0 : dt.millisecond, dt.offset === Timezones_1.UnsetZoneOffsetMinutes ? void 0 : dt.offset, opts == null ? void 0 : opts.rawValue, dt.zoneName == null || ((_a3 = dt.zone) == null ? void 0 : _a3.name) === Timezones_1.UnsetZone.name ? void 0 : dt.zoneName, opts == null ? void 0 : opts.inferredZone);
    }
    /**
     * Create an ExifDateTime from a number of milliseconds since the epoch
     * (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
     *
     * @param millis - a number of milliseconds since 1970 UTC
     *
     * @param options.rawValue - the original parsed string input
     * @param options.zone - the zone to place the DateTime into. Defaults to 'local'.
     * @param options.locale - a locale to set on the resulting DateTime instance
     * @param options.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @param options.numberingSystem - the numbering system to set on the resulting DateTime instance
     */
    static fromMillis(millis, options = {}) {
      if (options.zone == null || [Timezones_1.UnsetZoneName, Timezones_1.UnsetZone].includes(options.zone)) {
        delete options.zone;
      }
      let dt = luxon_1.DateTime.fromMillis(millis, {
        ...(0, Object_12.omit)(options, "rawValue")
      });
      if (options.zone == null) {
        dt = dt.setZone(Timezones_1.UnsetZone, { keepLocalTime: true });
      }
      return this.fromDateTime(dt, { rawValue: options.rawValue });
    }
    static now(opts = {}) {
      return this.fromMillis(Date.now(), opts);
    }
    get millis() {
      return this.millisecond;
    }
    get hasZone() {
      return this.zone != null;
    }
    get unsetMilliseconds() {
      return this.millisecond == null;
    }
    setZone(zone, opts) {
      const dt = (0, TimeParsing_1.setZone)({
        zone,
        src: this.toDateTime(),
        srcHasZone: this.hasZone,
        opts
      });
      return _a2.fromDateTime(dt, {
        rawValue: this.rawValue,
        unsetMilliseconds: this.millisecond == null,
        inferredZone: (opts == null ? void 0 : opts.inferredZone) ?? true
      });
    }
    /**
     * CAUTION: This instance will inherit the system timezone if this instance
     * has an unset zone (as Luxon doesn't support "unset" timezones)
     */
    toDateTime(overrideZone) {
      return __privateGet(this, _dt) ?? __privateSet(this, _dt, luxon_1.DateTime.fromObject({
        year: this.year,
        month: this.month,
        day: this.day,
        hour: this.hour,
        minute: this.minute,
        second: this.second,
        millisecond: this.millisecond
      }, {
        zone: overrideZone ?? this.zone
      }));
    }
    toEpochSeconds(overrideZone) {
      return this.toDateTime(overrideZone).toUnixInteger();
    }
    toDate() {
      return this.toDateTime().toJSDate();
    }
    toISOString(options = {}) {
      return (0, Maybe_1.denull)(this.toDateTime().toISO({
        suppressMilliseconds: options.suppressMilliseconds ?? this.millisecond == null,
        includeOffset: this.hasZone && options.includeOffset !== false
      }));
    }
    toExifString() {
      return (0, DateTime_12.dateTimeToExif)(this.toDateTime(), {
        includeOffset: this.hasZone,
        includeMilliseconds: this.millisecond != null
      });
    }
    toString() {
      return this.toISOString();
    }
    /**
     * @return the epoch milliseconds of this
     */
    toMillis() {
      return this.toDateTime().toMillis();
    }
    get isValid() {
      return this.toDateTime().isValid;
    }
    toJSON() {
      return {
        _ctor: "ExifDateTime",
        year: this.year,
        month: this.month,
        day: this.day,
        hour: this.hour,
        minute: this.minute,
        second: this.second,
        millisecond: this.millisecond,
        tzoffsetMinutes: this.tzoffsetMinutes,
        rawValue: this.rawValue,
        zoneName: this.zoneName,
        inferredZone: this.inferredZone
      };
    }
    /**
     * @return a new ExifDateTime from the given JSON. Note that this instance **may not be valid**.
     */
    static fromJSON(json) {
      return new _a2(json.year, json.month, json.day, json.hour, json.minute, json.second, json.millisecond, json.tzoffsetMinutes, json.rawValue, json.zoneName, json.inferredZone);
    }
    maybeMatchZone(target, maxDeltaMs = 14 * DateTime_12.MinuteMs) {
      var _a3, _b;
      const targetZone = target.zone;
      if (targetZone == null || !target.hasZone)
        return;
      return ((_a3 = this.setZone(targetZone, { keepLocalTime: false })) == null ? void 0 : _a3.ifClose(target, maxDeltaMs)) ?? ((_b = this.setZone(targetZone, { keepLocalTime: true })) == null ? void 0 : _b.ifClose(target, maxDeltaMs));
    }
    ifClose(target, maxDeltaMs = 14 * DateTime_12.MinuteMs) {
      const ts = this.toMillis();
      const targetTs = target.toMillis();
      return Math.abs(ts - targetTs) <= maxDeltaMs ? this : void 0;
    }
    plus(duration) {
      let dt = this.toDateTime().plus(duration);
      if (!this.hasZone) {
        dt = dt.setZone(Timezones_1.UnsetZone, { keepLocalTime: true });
      }
      return _a2.fromDateTime(dt, this);
    }
  }, _ExifDateTime_static = new WeakSet(), fromPatterns_fn = function(text, fmts) {
    const result = (0, TimeParsing_1.parseDateTime)(text, fmts);
    return result == null ? void 0 : _a2.fromDateTime(result.dt, {
      rawValue: text,
      unsetMilliseconds: result.unsetMilliseconds,
      inferredZone: result.inferredZone
    });
  }, looseExifFormats_fn = function* (defaultZone2) {
    const formats = [
      "MMM d y HH:mm:ss",
      "MMM d y, HH:mm:ss",
      // Thu Oct 13 00:12:27 2016:
      "ccc MMM d HH:mm:ss y"
    ];
    const zone = (0, String_12.notBlank)(defaultZone2) ? defaultZone2 : Timezones_1.UnsetZone;
    for (const fmt of formats) {
      yield { fmt, zone, inferredZone: true };
    }
  }, _dt = new WeakMap(), __privateAdd(_a2, _ExifDateTime_static), _a2);
  ExifDateTime.ExifDateTime = ExifDateTime$1;
  return ExifDateTime;
}
var hasRequiredDateTime;
function requireDateTime() {
  if (hasRequiredDateTime) return DateTime2;
  hasRequiredDateTime = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DayMs = exports2.HourMs = exports2.MinuteMs = exports2.SecondMs = void 0;
    exports2.validDateTime = validDateTime;
    exports2.isDateOrTime = isDateOrTime;
    exports2.dateTimeToExif = dateTimeToExif;
    exports2.toExifString = toExifString;
    exports2.hms = hms;
    const luxon_1 = luxon;
    const ExifDate_12 = requireExifDate();
    const ExifDateTime_12 = requireExifDateTime();
    const ExifTime_12 = requireExifTime();
    function validDateTime(dt) {
      return dt != null && dt.isValid;
    }
    exports2.SecondMs = 1e3;
    exports2.MinuteMs = 60 * exports2.SecondMs;
    exports2.HourMs = 60 * exports2.MinuteMs;
    exports2.DayMs = 24 * exports2.HourMs;
    function isDateOrTime(o) {
      return o instanceof ExifDateTime_12.ExifDateTime || o instanceof ExifDate_12.ExifDate || o instanceof ExifTime_12.ExifTime || luxon_1.DateTime.isDateTime(o);
    }
    function dateTimeToExif(d, opts) {
      return d.toFormat("y:MM:dd HH:mm:ss" + ((opts == null ? void 0 : opts.includeMilliseconds) === true ? ".u" : "") + ((opts == null ? void 0 : opts.includeOffset) === false ? "" : "ZZ"));
    }
    function toExifString(d) {
      var _a2;
      if (luxon_1.DateTime.isDateTime(d)) {
        return dateTimeToExif(d);
      } else {
        return (_a2 = d == null ? void 0 : d.toExifString) == null ? void 0 : _a2.call(d);
      }
    }
    function hms(d, opts) {
      return d.toFormat("HH:mm:ss" + ((opts == null ? void 0 : opts.includeMilliseconds) === true ? ".SSS" : ""));
    }
  })(DateTime2);
  return DateTime2;
}
var hasRequiredExifDate;
function requireExifDate() {
  if (hasRequiredExifDate) return ExifDate;
  hasRequiredExifDate = 1;
  Object.defineProperty(ExifDate, "__esModule", { value: true });
  ExifDate.ExifDate = void 0;
  const luxon_1 = luxon;
  const DateTime_12 = requireDateTime();
  const Maybe_1 = Maybe;
  const String_12 = _String;
  const StrictExifRE = /^\d{1,4}:\d{1,2}:\d{1,2}|\d{1,4}-\d{1,2}-\d{1,2}$/;
  const LooseExifRE = /^\S+\s+\S+\s+\S+$/;
  let ExifDate$1 = class ExifDate2 {
    constructor(year, month, day, rawValue) {
      __publicField(this, "year");
      __publicField(this, "month");
      __publicField(this, "day");
      __publicField(this, "rawValue");
      this.year = year;
      this.month = month;
      this.day = day;
      this.rawValue = rawValue;
    }
    static from(exifOrIso) {
      return (
        // in order of strictness:
        this.fromExifStrict(exifOrIso) ?? this.fromISO(exifOrIso) ?? this.fromExifLoose(exifOrIso)
      );
    }
    static fromISO(text) {
      return StrictExifRE.test((0, String_12.toS)(text).trim()) ? this.fromDateTime(luxon_1.DateTime.fromISO(text), text) : void 0;
    }
    static fromPatterns(text, fmts) {
      if ((0, String_12.blank)(text))
        return;
      text = (0, String_12.toS)(text).trim();
      for (const fmt of fmts) {
        const dt = luxon_1.DateTime.fromFormat(text, fmt);
        if ((0, DateTime_12.validDateTime)(dt)) {
          return this.fromDateTime(dt, text);
        }
      }
      return;
    }
    // These are all formats I've seen in the wild from exiftool's output.
    // More iterations might make sense, like "d MMM, y" or "MMM d, y", but I
    // want to be constrained in what I consider a valid date to lessen the
    // chance of misinterpreting a given value.
    static fromExifStrict(text) {
      return StrictExifRE.test((0, String_12.toS)(text).trim()) ? this.fromPatterns(text, ["y:MM:dd", "y-MM-dd", "y:M:d"]) : void 0;
    }
    static fromExifLoose(text) {
      return LooseExifRE.test((0, String_12.toS)(text).trim()) ? this.fromPatterns(text, ["MMM d y", "MMMM d y"]) : void 0;
    }
    static fromEXIF(text) {
      return (0, Maybe_1.firstDefinedThunk)([
        () => this.fromExifStrict(text),
        () => this.fromExifLoose(text)
      ]);
    }
    static fromDateTime(dt, rawValue) {
      return (0, DateTime_12.validDateTime)(dt) ? new ExifDate2(dt.year, dt.month, dt.day, rawValue) : void 0;
    }
    toDate() {
      return new Date(this.year, this.month - 1, this.day);
    }
    /**
     * @param deltaMs defaults to 12 hours, so toMillis() is in the middle of the day.
     *
     * @return the epoch milliseconds for this day in UTC, plus `deltaMs` milliseconds.
     */
    toMillis(deltaMs = 12 * DateTime_12.HourMs) {
      return this.toDate().getTime() + deltaMs;
    }
    toISOString() {
      return this.toString("-");
    }
    toExifString() {
      return this.toString(":");
    }
    toString(sep = "-") {
      return `${this.year}${sep}${(0, String_12.pad2)(this.month, this.day).join(sep)}`;
    }
    toJSON() {
      return {
        _ctor: "ExifDate",
        year: this.year,
        month: this.month,
        day: this.day,
        rawValue: this.rawValue
      };
    }
    static fromJSON(json) {
      return new ExifDate2(json.year, json.month, json.day, json.rawValue);
    }
  };
  ExifDate.ExifDate = ExifDate$1;
  return ExifDate;
}
var GPS = {};
var CoordinateParser = {};
Object.defineProperty(CoordinateParser, "__esModule", { value: true });
CoordinateParser.parseCoordinates = parseCoordinates;
CoordinateParser.parseDecimalCoordinate = parseDecimalCoordinate;
CoordinateParser.parseCoordinate = parseCoordinate;
const Number_1$1 = _Number;
const Object_1 = _Object;
const MAX_LATITUDE_DEGREES = 90;
const MAX_LONGITUDE_DEGREES = 180;
class CoordinateParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "CoordinateParseError";
  }
}
function parseCoordinates(input) {
  if (!(input == null ? void 0 : input.trim())) {
    throw new CoordinateParseError("Input string cannot be empty");
  }
  let latitude;
  let longitude;
  for (const coord of _parseCoordinates(input)) {
    if (!coord.direction) {
      throw new CoordinateParseError("Direction is required for position parsing");
    }
    if (coord.direction === "S" || coord.direction === "N") {
      if (latitude !== void 0) {
        throw new CoordinateParseError("Multiple latitude values found");
      }
      latitude = toDecimalDegrees(coord);
    } else {
      if (longitude !== void 0) {
        throw new CoordinateParseError("Multiple longitude values found");
      }
      longitude = toDecimalDegrees(coord);
    }
  }
  const missing = [];
  if (latitude === void 0)
    missing.push("latitude");
  if (longitude === void 0)
    missing.push("longitude");
  if (latitude === void 0 || longitude === void 0) {
    throw new CoordinateParseError(`Missing ${missing.join(" and ")}`);
  } else {
    return { latitude, longitude };
  }
}
function _parseCoordinates(input) {
  if (!(input == null ? void 0 : input.trim())) {
    throw new CoordinateParseError("Input string cannot be empty");
  }
  const result = [];
  let remainder = input;
  do {
    const coord = parseCoordinate(remainder);
    remainder = coord.remainder ?? "";
    result.push((0, Object_1.omit)(coord, "remainder"));
  } while (remainder.length > 0);
  return result;
}
function parseDecimalCoordinate(input) {
  if (!(input == null ? void 0 : input.trim())) {
    throw new CoordinateParseError("Input string cannot be empty");
  }
  const coord = parseCoordinate(input);
  if (coord.format !== "D") {
    throw new CoordinateParseError("Expected decimal degrees format");
  }
  if (!coord.direction) {
    throw new CoordinateParseError("Missing direction");
  }
  return { degrees: toDecimalDegrees(coord), direction: coord.direction };
}
function parseCoordinate(input) {
  if (!(input == null ? void 0 : input.trim())) {
    throw new CoordinateParseError("Input string cannot be empty");
  }
  const dmsPattern = /^(?<degrees>-?\d+)\s*(?:°|DEG)\s*(?<minutes>\d+)\s*['′]\s*(?<seconds>\d+(?:\.\d+)?)\s*["″]\s?(?<direction>[NSEW])?[\s,]{0,3}(?<remainder>.*)$/i;
  const dmPattern = /^(?<degrees>-?\d+)\s*(?:°|DEG)\s*(?<minutes>\d+(?:\.\d+)?)\s?['′]\s?(?<direction>[NSEW])?(?<remainder>.*)$/i;
  const dPattern = /^(?<degrees>-?\d+(?:\.\d+)?)\s*(?:°|DEG)\s?(?<direction>[NSEW])?(?<remainder>.*)$/i;
  const trimmedInput = input.trimStart();
  let match2;
  let format;
  if (match2 = trimmedInput.match(dmsPattern)) {
    format = "DMS";
  } else if (match2 = trimmedInput.match(dmPattern)) {
    format = "DM";
  } else if (match2 = trimmedInput.match(dPattern)) {
    format = "D";
  } else {
    throw new CoordinateParseError(`Invalid coordinate format. Expected one of:
  DDD° MM' SS.S" k (deg/min/sec)
  DDD° MM.MMM' k (deg/decimal minutes)
  DDD.DDDDD° (decimal degrees)
  (where k indicates direction: N, S, E, or W)`);
  }
  if (!match2.groups) {
    throw new CoordinateParseError("Failed to parse coordinate components");
  }
  const { degrees: degreesStr, minutes: minutesStr, seconds: secondsStr, direction: directionStr, remainder } = match2.groups;
  const direction = directionStr == null ? void 0 : directionStr.toUpperCase();
  const degrees = parseFloat(degreesStr);
  let minutes;
  let seconds;
  if (format === "DMS") {
    minutes = parseInt(minutesStr, 10);
    seconds = parseFloat(secondsStr);
    if (minutes >= 60) {
      throw new CoordinateParseError("Minutes must be between 0 and 59");
    }
    if (seconds >= 60) {
      throw new CoordinateParseError("Seconds must be between 0 and 59.999...");
    }
  } else if (format === "DM") {
    minutes = parseFloat(minutesStr);
    if (minutes >= 60) {
      throw new CoordinateParseError("Minutes must be between 0 and 59.999...");
    }
  }
  const maxDegrees = direction === "N" || direction === "S" ? MAX_LATITUDE_DEGREES : MAX_LONGITUDE_DEGREES;
  if (Math.abs(degrees) > maxDegrees) {
    throw new CoordinateParseError(`Degrees must be between -${maxDegrees} and ${maxDegrees} for ${direction} direction`);
  }
  return {
    degrees,
    minutes,
    seconds,
    direction,
    format,
    remainder: remainder == null ? void 0 : remainder.trim()
  };
}
function toDecimalDegrees(coord) {
  let decimal = coord.degrees;
  decimal += (coord.minutes ?? 0) / 60;
  decimal += (coord.seconds ?? 0) / 3600;
  if (coord.direction === "S" || coord.direction === "W") {
    decimal = -Math.abs(decimal);
  }
  const maxDegrees = coord.direction === "N" || coord.direction === "S" ? MAX_LATITUDE_DEGREES : MAX_LONGITUDE_DEGREES;
  const axis = coord.direction === "N" || coord.direction === "S" ? "latitude" : "longitude";
  if (Math.abs(decimal) > maxDegrees) {
    throw new CoordinateParseError(`Degrees must be between -${maxDegrees} and ${maxDegrees} for ${axis}`);
  }
  return (0, Number_1$1.roundToDecimalPlaces)(decimal, 6);
}
Object.defineProperty(GPS, "__esModule", { value: true });
GPS.parseGPSLocation = parseGPSLocation;
const CoordinateParser_1 = CoordinateParser;
const Number_1 = _Number;
const Pick_1 = Pick;
const String_1 = _String;
const MAX_LAT_LON_DIFF = 1;
function parsePosition(position) {
  if ((0, String_1.blank)(position))
    return;
  const [lat, lon] = (0, String_1.toS)(position).split(/[, ]+/).map(Number_1.toFloat);
  return lat != null && lon != null ? [lat, lon] : void 0;
}
function processCoordinate(config, warnings) {
  let { value, ref } = config;
  const { geoValue, coordinateType } = config;
  const { expectedRefPositive, expectedRefNegative, max } = config;
  let isInvalid = false;
  ref = (ref == null ? void 0 : ref.trim().toUpperCase().slice(0, 1)) ?? (value < 0 ? expectedRefNegative : expectedRefPositive);
  if (Math.abs(value) > max) {
    isInvalid = true;
    warnings.push(`Invalid GPS${coordinateType}: ${value} is out of range`);
    return { value, ref, isInvalid };
  }
  if (ref === expectedRefNegative) {
    value = -Math.abs(value);
  }
  if (geoValue != null && Math.abs(Math.abs(geoValue) - Math.abs(value)) < MAX_LAT_LON_DIFF) {
    if (Math.sign(geoValue) !== Math.sign(value)) {
      value = -value;
      warnings.push(`Corrected GPS${coordinateType} sign based on GeolocationPosition`);
    }
    const expectedRef2 = geoValue < 0 ? expectedRefNegative : expectedRefPositive;
    if (ref !== expectedRef2) {
      ref = expectedRef2;
      warnings.push(`Corrected GPS${coordinateType}Ref to ${expectedRef2} based on GeolocationPosition`);
    }
  }
  const expectedRef = value < 0 ? expectedRefNegative : expectedRefPositive;
  if (ref != null && ref !== expectedRef) {
    warnings.push(`Corrected GPS${coordinateType}Ref to ${ref} to match coordinate sign`);
  }
  ref = expectedRef;
  return { value, ref, isInvalid };
}
function parseGPSLocation(tags, opts) {
  let parsed = false;
  const warnings = [];
  const result = (0, Pick_1.pick)(tags, "GPSLatitude", "GPSLatitudeRef", "GPSLongitude", "GPSLongitudeRef");
  if ((0, String_1.notBlankString)(tags.GPSPosition)) {
    try {
      const pos = (0, CoordinateParser_1.parseCoordinates)(tags.GPSPosition);
      if (opts.ignoreZeroZeroLatLon === true && pos.latitude === 0 && pos.longitude === 0) {
        warnings.push("Ignoring zero coordinates from GPSPosition");
      } else {
        parsed = true;
        result.GPSLatitude = pos.latitude;
        result.GPSLongitude = pos.longitude;
        result.GPSLatitudeRef = pos.latitude < 0 ? "S" : "N";
        result.GPSLongitudeRef = pos.longitude < 0 ? "W" : "E";
      }
    } catch (e) {
      warnings.push("Error parsing GPSPosition: " + e);
    }
  }
  if (!parsed && (0, String_1.notBlankString)(tags.GPSLatitude) && (0, String_1.notBlankString)(tags.GPSLongitude)) {
    try {
      const lat = (0, CoordinateParser_1.parseCoordinate)(tags.GPSLatitude);
      const lon = (0, CoordinateParser_1.parseCoordinate)(tags.GPSLongitude);
      if (opts.ignoreZeroZeroLatLon === true && lat.degrees === 0 && lon.degrees === 0) {
        warnings.push("Ignoring zero coordinates from GPSLatitude/GPSLongitude");
        return { invalid: true, warnings };
      } else {
        result.GPSLatitude = lat.degrees;
        result.GPSLongitude = lon.degrees;
        result.GPSLatitudeRef = lat.direction;
        result.GPSLongitudeRef = lon.direction;
      }
    } catch (e) {
      warnings.push(`Error parsing GPSLatitude or GPSLongitude: ` + e);
    }
  }
  if (!(0, Number_1.isNumber)(result.GPSLatitude) && !(0, Number_1.isNumber)(result.GPSLongitude)) {
    return {};
  }
  if (opts.ignoreZeroZeroLatLon === true && result.GPSLatitude === 0 && result.GPSLongitude === 0) {
    warnings.push("Ignoring zero GPSLatitude and GPSLongitude");
    return { invalid: true, warnings };
  }
  const [geoLat, geoLon] = parsePosition(tags.GeolocationPosition) ?? [
    void 0,
    void 0
  ];
  let isInvalid = false;
  if ((0, Number_1.isNumber)(result.GPSLatitude)) {
    const latitudeResult = processCoordinate({
      value: result.GPSLatitude,
      ref: result.GPSLatitudeRef,
      geoValue: geoLat,
      expectedRefPositive: "N",
      expectedRefNegative: "S",
      max: 90,
      coordinateType: "Latitude"
    }, warnings);
    result.GPSLatitude = latitudeResult.value;
    result.GPSLatitudeRef = latitudeResult.ref;
    isInvalid = isInvalid || latitudeResult.isInvalid;
  }
  if ((0, Number_1.isNumber)(result.GPSLongitude)) {
    const longitudeResult = processCoordinate({
      value: result.GPSLongitude,
      ref: result.GPSLongitudeRef,
      geoValue: geoLon,
      expectedRefPositive: "E",
      expectedRefNegative: "W",
      max: 180,
      coordinateType: "Longitude"
    }, warnings);
    result.GPSLongitude = longitudeResult.value;
    result.GPSLongitudeRef = longitudeResult.ref;
    isInvalid = isInvalid || longitudeResult.isInvalid;
  }
  return isInvalid ? { invalid: true, warnings } : { result, invalid: false, warnings };
}
var OnlyZerosRE = {};
Object.defineProperty(OnlyZerosRE, "__esModule", { value: true });
OnlyZerosRE.OnlyZerosRE = void 0;
OnlyZerosRE.OnlyZerosRE = /^0+$/;
(function(exports2) {
  var _raw, _rawDegrouped, _tags, _ReadTask_instances, isVideo_fn, defaultToUTC_fn, tagName_fn, parseTags_fn, _extractGpsMetadata, _gpsIsInvalid, _gpsResults, _extractTzOffsetFromGps, _tz, _extractTzOffset, parseTag_fn;
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ReadTask = exports2.DefaultReadTaskOptions = exports2.ReadTaskOptionFields = void 0;
  exports2.nullish = nullish;
  const batch_cluster_12 = BatchCluster;
  const _path2 = __importStar2(require$$1$1);
  const Array_12 = _Array;
  const BinaryField_12 = BinaryField$1;
  const Boolean_1 = _Boolean;
  const DefaultExifToolOptions_1 = DefaultExifToolOptions;
  const ErrorsAndWarnings_12 = ErrorsAndWarnings;
  const ExifDate_12 = requireExifDate();
  const ExifDateTime_12 = requireExifDateTime();
  const ExifTime_12 = requireExifTime();
  const ExifToolOptions_1 = ExifToolOptions;
  const ExifToolTask_12 = ExifToolTask$1;
  const FilenameCharsetArgs_12 = FilenameCharsetArgs;
  const GPS_1 = GPS;
  const Lazy_12 = Lazy;
  const Number_12 = _Number;
  const OnlyZerosRE_1 = OnlyZerosRE;
  const Pick_12 = Pick;
  const String_12 = _String;
  const Timezones_1 = requireTimezones();
  const PassthroughTags = [
    "ExifToolVersion",
    "DateStampMode",
    "Sharpness",
    "Firmware",
    "DateDisplayFormat"
  ];
  exports2.ReadTaskOptionFields = [
    "backfillTimezones",
    "defaultVideosToUTC",
    "geolocation",
    "geoTz",
    "ignoreMinorErrors",
    "ignoreZeroZeroLatLon",
    "imageHashType",
    "includeImageDataMD5",
    "inferTimezoneFromDatestamps",
    "inferTimezoneFromDatestampTags",
    "inferTimezoneFromTimeStamp",
    "numericTags",
    "useMWG",
    "struct",
    "readArgs",
    "adjustTimeZoneIfDaylightSavings",
    "preferTimezoneInferenceFromGps"
  ];
  const NullIsh = ["undef", "null", "undefined"];
  function nullish(s2) {
    return s2 == null || (0, String_12.isString)(s2) && NullIsh.includes(s2.trim());
  }
  exports2.DefaultReadTaskOptions = {
    ...(0, Pick_12.pick)(DefaultExifToolOptions_1.DefaultExifToolOptions, ...exports2.ReadTaskOptionFields)
  };
  const MaybeDateOrTimeRe = /when|date|time|subsec|creat|modif/i;
  const _ReadTask = class _ReadTask extends ExifToolTask_12.ExifToolTask {
    /**
     * @param sourceFile the file to read
     * @param args the full arguments to pass to exiftool that take into account
     * the flags in `options`
     */
    constructor(sourceFile, args, options) {
      super(args, options);
      __privateAdd(this, _ReadTask_instances);
      __publicField(this, "sourceFile");
      __publicField(this, "args");
      __publicField(this, "options");
      __publicField(this, "degroup");
      __privateAdd(this, _raw, {});
      __privateAdd(this, _rawDegrouped, {});
      __privateAdd(this, _tags, {});
      __privateAdd(this, _extractGpsMetadata, (0, Lazy_12.lazy)(() => (0, GPS_1.parseGPSLocation)(__privateGet(this, _rawDegrouped), this.options)));
      __privateAdd(this, _gpsIsInvalid, (0, Lazy_12.lazy)(() => {
        var _a2;
        return ((_a2 = __privateGet(this, _extractGpsMetadata).call(this)) == null ? void 0 : _a2.invalid) ?? false;
      }));
      __privateAdd(this, _gpsResults, (0, Lazy_12.lazy)(() => {
        var _a2;
        return __privateGet(this, _gpsIsInvalid).call(this) ? {} : ((_a2 = __privateGet(this, _extractGpsMetadata).call(this)) == null ? void 0 : _a2.result) ?? {};
      }));
      __privateAdd(this, _extractTzOffsetFromGps, (0, Lazy_12.lazy)(() => {
        var _a2, _b;
        const gps = __privateGet(this, _extractGpsMetadata).call(this);
        const lat = (_a2 = gps == null ? void 0 : gps.result) == null ? void 0 : _a2.GPSLatitude;
        const lon = (_b = gps == null ? void 0 : gps.result) == null ? void 0 : _b.GPSLongitude;
        if (gps == null || gps.invalid === true || lat == null || lon == null)
          return;
        const tz2 = (0, Timezones_1.normalizeZone)(__privateGet(this, _rawDegrouped).GeolocationTimeZone);
        if (tz2 != null) {
          return {
            tz: tz2.name,
            src: "GeolocationTimeZone"
          };
        }
        try {
          const geoTz2 = this.options.geoTz(lat, lon);
          const zone = (0, Timezones_1.normalizeZone)(geoTz2);
          if (zone != null) {
            return {
              tz: zone.name,
              src: "GPSLatitude/GPSLongitude"
            };
          }
        } catch (error) {
          this.warnings.push("Failed to determine timezone from GPS coordinates: " + error);
        }
        return;
      }));
      __privateAdd(this, _tz, (0, Lazy_12.lazy)(() => {
        var _a2;
        return (_a2 = __privateGet(this, _extractTzOffset).call(this)) == null ? void 0 : _a2.tz;
      }));
      __privateAdd(this, _extractTzOffset, (0, Lazy_12.lazy)(() => {
        if (true === this.options.preferTimezoneInferenceFromGps) {
          const fromGps = __privateGet(this, _extractTzOffsetFromGps).call(this);
          if (fromGps != null) {
            return fromGps;
          }
        }
        return (0, Timezones_1.extractTzOffsetFromTags)(__privateGet(this, _rawDegrouped), this.options) ?? __privateGet(this, _extractTzOffsetFromGps).call(this) ?? (0, Timezones_1.extractTzOffsetFromDatestamps)(__privateGet(this, _rawDegrouped), this.options) ?? // See https://github.com/photostructure/exiftool-vendored.js/issues/113
        // and https://github.com/photostructure/exiftool-vendored.js/issues/156
        // Videos are frequently encoded in UTC, but don't include the
        // timezone offset in their datetime stamps.
        (__privateMethod(this, _ReadTask_instances, defaultToUTC_fn).call(this) ? {
          tz: "UTC",
          src: "defaultVideosToUTC"
        } : (
          // not applicable:
          void 0
        )) ?? // This is a last-ditch estimation heuristic:
        (0, Timezones_1.extractTzOffsetFromUTCOffset)(__privateGet(this, _rawDegrouped)) ?? // No, really, this is the even worse than UTC offset heuristics:
        (0, Timezones_1.extractTzOffsetFromTimeStamp)(__privateGet(this, _rawDegrouped), this.options);
      }));
      this.sourceFile = sourceFile;
      this.args = args;
      this.options = options;
      this.degroup = this.args.includes("-G");
      __privateSet(this, _tags, { SourceFile: sourceFile });
      __privateGet(this, _tags).errors = this.errors;
    }
    static for(filename, options) {
      const opts = (0, ExifToolOptions_1.handleDeprecatedOptions)({
        ...exports2.DefaultReadTaskOptions,
        ...options
      });
      const sourceFile = _path2.resolve(filename);
      const args = [...FilenameCharsetArgs_12.Utf8FilenameCharsetArgs, "-json", ...(0, Array_12.toA)(opts.readArgs)];
      args.push("-api", "struct=" + ((0, Number_12.isNumber)(opts.struct) ? opts.struct : "0"));
      if (opts.useMWG) {
        args.push("-use", "MWG");
      }
      if (opts.imageHashType != null && opts.imageHashType !== false) {
        args.push("-api", "requesttags=imagedatahash");
        args.push("-api", "imagehashtype=" + opts.imageHashType);
      }
      if (true === opts.geolocation) {
        args.push("-api", "geolocation");
      }
      args.push(...opts.numericTags.map((ea) => "-" + ea + "#"));
      args.push("-all", sourceFile);
      return new _ReadTask(sourceFile, args, opts);
    }
    toString() {
      return "ReadTask" + this.sourceFile + ")";
    }
    // only exposed for tests
    parse(data, err) {
      try {
        __privateSet(this, _raw, JSON.parse(data)[0]);
      } catch (jsonError) {
        (0, batch_cluster_12.logger)().warn("ExifTool.ReadTask(): Invalid JSON", {
          data,
          err,
          jsonError
        });
        throw err ?? jsonError;
      }
      const SourceFile = _path2.resolve(__privateGet(this, _raw).SourceFile);
      if (SourceFile !== this.sourceFile) {
        throw new Error(`Internal error: unexpected SourceFile of ${__privateGet(this, _raw).SourceFile} for file ${this.sourceFile}`);
      }
      return __privateMethod(this, _ReadTask_instances, parseTags_fn).call(this);
    }
  };
  _raw = new WeakMap();
  _rawDegrouped = new WeakMap();
  _tags = new WeakMap();
  _ReadTask_instances = new WeakSet();
  isVideo_fn = function() {
    var _a2;
    return String((_a2 = __privateGet(this, _rawDegrouped)) == null ? void 0 : _a2.MIMEType).startsWith("video/");
  };
  defaultToUTC_fn = function() {
    return __privateMethod(this, _ReadTask_instances, isVideo_fn).call(this) && this.options.defaultVideosToUTC;
  };
  tagName_fn = function(k) {
    return this.degroup ? k.split(":")[1] ?? k : k;
  };
  parseTags_fn = function() {
    if (this.degroup) {
      __privateSet(this, _rawDegrouped, {});
      for (const [key, value] of Object.entries(__privateGet(this, _raw))) {
        const k = __privateMethod(this, _ReadTask_instances, tagName_fn).call(this, key);
        __privateGet(this, _rawDegrouped)[k] = value;
      }
    } else {
      __privateSet(this, _rawDegrouped, __privateGet(this, _raw));
    }
    const tags = __privateGet(this, _tags);
    __privateGet(this, _extractGpsMetadata).call(this);
    const tzSrc = __privateGet(this, _extractTzOffset).call(this);
    if (tzSrc) {
      tags.tz = tzSrc.tz;
      tags.tzSource = tzSrc.src;
    }
    for (const [key, value] of Object.entries(__privateGet(this, _raw))) {
      const k = __privateMethod(this, _ReadTask_instances, tagName_fn).call(this, key);
      const v = __privateMethod(this, _ReadTask_instances, parseTag_fn).call(this, k, value);
      if (v != null)
        tags[key] = v;
    }
    const { errors, warnings } = (0, ErrorsAndWarnings_12.errorsAndWarnings)(this, tags);
    tags.errors = errors;
    tags.warnings = warnings;
    return tags;
  };
  _extractGpsMetadata = new WeakMap();
  _gpsIsInvalid = new WeakMap();
  _gpsResults = new WeakMap();
  _extractTzOffsetFromGps = new WeakMap();
  _tz = new WeakMap();
  _extractTzOffset = new WeakMap();
  parseTag_fn = function(tagName, value) {
    if (nullish(value))
      return void 0;
    try {
      if (PassthroughTags.indexOf(tagName) >= 0) {
        return value;
      }
      if (tagName.startsWith("GPS") || tagName.startsWith("Geolocation")) {
        if (__privateGet(this, _gpsIsInvalid).call(this))
          return void 0;
        const parsed = __privateGet(this, _gpsResults).call(this)[tagName];
        if (parsed != null)
          return parsed;
      }
      if (Array.isArray(value)) {
        return value.map((ea) => __privateMethod(this, _ReadTask_instances, parseTag_fn).call(this, tagName, ea));
      }
      if (typeof value === "object") {
        const result = {};
        for (const [k, v] of Object.entries(value)) {
          result[k] = __privateMethod(this, _ReadTask_instances, parseTag_fn).call(this, tagName + "." + k, v);
        }
        return result;
      }
      if (typeof value === "string") {
        const b = BinaryField_12.BinaryField.fromRawValue(value);
        if (b != null)
          return b;
        if (/Valid$/.test(tagName)) {
          const b2 = (0, Boolean_1.toBoolean)(value);
          if (b2 != null)
            return b2;
        }
        if (MaybeDateOrTimeRe.test(tagName) && // Reject date/time keys that are "0" or "00" (found in Canon
        // SubSecTime values)
        !OnlyZerosRE_1.OnlyZerosRE.test(value)) {
          const tz2 = isUtcTagName(tagName) || __privateMethod(this, _ReadTask_instances, defaultToUTC_fn).call(this) ? "UTC" : this.options.backfillTimezones ? __privateGet(this, _tz).call(this) : void 0;
          const keyIncludesTime = /subsec|time/i.test(tagName);
          const keyIncludesDate = /date/i.test(tagName);
          const keyIncludesWhen = /when/i.test(tagName);
          const result = (keyIncludesTime || keyIncludesDate || keyIncludesWhen ? ExifDateTime_12.ExifDateTime.from(value, tz2) : void 0) ?? (keyIncludesTime || keyIncludesWhen ? ExifTime_12.ExifTime.fromEXIF(value, tz2) : void 0) ?? (keyIncludesDate || keyIncludesWhen ? ExifDate_12.ExifDate.from(value) : void 0) ?? value;
          const defaultTz = __privateGet(this, _tz).call(this);
          if (this.options.backfillTimezones && result != null && defaultTz != null && result instanceof ExifDateTime_12.ExifDateTime && __privateMethod(this, _ReadTask_instances, defaultToUTC_fn).call(this) && !isUtcTagName(tagName) && true === result.inferredZone) {
            return result.setZone(defaultTz);
          }
          return result;
        }
      }
      return value;
    } catch (e) {
      this.warnings.push(`Failed to parse ${tagName} with value ${JSON.stringify(value)}: ${e}`);
      return value;
    }
  };
  let ReadTask2 = _ReadTask;
  exports2.ReadTask = ReadTask2;
  function isUtcTagName(tagName) {
    return tagName.includes("UTC") || tagName.startsWith("GPS");
  }
})(ReadTask);
var RewriteAllTagsTask$1 = {};
var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
Object.defineProperty(RewriteAllTagsTask$1, "__esModule", { value: true });
RewriteAllTagsTask$1.RewriteAllTagsTask = void 0;
const _path = __importStar(require$$1$1);
const Array_1 = _Array;
const ExifToolTask_1 = ExifToolTask$1;
const FilenameCharsetArgs_1 = FilenameCharsetArgs;
class RewriteAllTagsTask extends ExifToolTask_1.ExifToolTask {
  constructor(args, options) {
    super(args, options);
  }
  static for(imgSrc, imgDest, opts) {
    const args = (0, Array_1.compact)([
      ...FilenameCharsetArgs_1.Utf8FilenameCharsetArgs,
      "-all=",
      "-tagsfromfile",
      "@",
      "-all:all",
      "-unsafe",
      "-icc_profile",
      opts.allowMakerNoteRepair ? "-F" : void 0,
      "-out",
      _path.resolve(imgDest),
      _path.resolve(imgSrc)
    ]);
    return new RewriteAllTagsTask(args, opts);
  }
  parse(data, error) {
    if (error != null) {
      const str = String(error);
      if (str.match(/\berror\b/i) != null && !str.match(/\bwarning\b/i)) {
        throw error;
      }
    }
    if (null == data.match(/^\s*1 image files creat/i)) {
      throw error ?? new Error(data.trim().split("\n")[0] ?? "Missing expected status message");
    }
  }
}
RewriteAllTagsTask$1.RewriteAllTagsTask = RewriteAllTagsTask;
var WriteTask = {};
var he = { exports: {} };
/*! https://mths.be/he v1.2.0 by @mathias | MIT license */
he.exports;
(function(module2, exports2) {
  (function(root) {
    var freeExports = exports2;
    var freeModule = module2.exports == freeExports && module2;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
      root = freeGlobal;
    }
    var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var regexAsciiWhitelist = /[\x01-\x7F]/g;
    var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
    var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
    var encodeMap = { "­": "shy", "‌": "zwnj", "‍": "zwj", "‎": "lrm", "⁣": "ic", "⁢": "it", "⁡": "af", "‏": "rlm", "​": "ZeroWidthSpace", "⁠": "NoBreak", "̑": "DownBreve", "⃛": "tdot", "⃜": "DotDot", "	": "Tab", "\n": "NewLine", " ": "puncsp", " ": "MediumSpace", " ": "thinsp", " ": "hairsp", " ": "emsp13", " ": "ensp", " ": "emsp14", " ": "emsp", " ": "numsp", " ": "nbsp", "  ": "ThickSpace", "‾": "oline", "_": "lowbar", "‐": "dash", "–": "ndash", "—": "mdash", "―": "horbar", ",": "comma", ";": "semi", "⁏": "bsemi", ":": "colon", "⩴": "Colone", "!": "excl", "¡": "iexcl", "?": "quest", "¿": "iquest", ".": "period", "‥": "nldr", "…": "mldr", "·": "middot", "'": "apos", "‘": "lsquo", "’": "rsquo", "‚": "sbquo", "‹": "lsaquo", "›": "rsaquo", '"': "quot", "“": "ldquo", "”": "rdquo", "„": "bdquo", "«": "laquo", "»": "raquo", "(": "lpar", ")": "rpar", "[": "lsqb", "]": "rsqb", "{": "lcub", "}": "rcub", "⌈": "lceil", "⌉": "rceil", "⌊": "lfloor", "⌋": "rfloor", "⦅": "lopar", "⦆": "ropar", "⦋": "lbrke", "⦌": "rbrke", "⦍": "lbrkslu", "⦎": "rbrksld", "⦏": "lbrksld", "⦐": "rbrkslu", "⦑": "langd", "⦒": "rangd", "⦓": "lparlt", "⦔": "rpargt", "⦕": "gtlPar", "⦖": "ltrPar", "⟦": "lobrk", "⟧": "robrk", "⟨": "lang", "⟩": "rang", "⟪": "Lang", "⟫": "Rang", "⟬": "loang", "⟭": "roang", "❲": "lbbrk", "❳": "rbbrk", "‖": "Vert", "§": "sect", "¶": "para", "@": "commat", "*": "ast", "/": "sol", "undefined": null, "&": "amp", "#": "num", "%": "percnt", "‰": "permil", "‱": "pertenk", "†": "dagger", "‡": "Dagger", "•": "bull", "⁃": "hybull", "′": "prime", "″": "Prime", "‴": "tprime", "⁗": "qprime", "‵": "bprime", "⁁": "caret", "`": "grave", "´": "acute", "˜": "tilde", "^": "Hat", "¯": "macr", "˘": "breve", "˙": "dot", "¨": "die", "˚": "ring", "˝": "dblac", "¸": "cedil", "˛": "ogon", "ˆ": "circ", "ˇ": "caron", "°": "deg", "©": "copy", "®": "reg", "℗": "copysr", "℘": "wp", "℞": "rx", "℧": "mho", "℩": "iiota", "←": "larr", "↚": "nlarr", "→": "rarr", "↛": "nrarr", "↑": "uarr", "↓": "darr", "↔": "harr", "↮": "nharr", "↕": "varr", "↖": "nwarr", "↗": "nearr", "↘": "searr", "↙": "swarr", "↝": "rarrw", "↝̸": "nrarrw", "↞": "Larr", "↟": "Uarr", "↠": "Rarr", "↡": "Darr", "↢": "larrtl", "↣": "rarrtl", "↤": "mapstoleft", "↥": "mapstoup", "↦": "map", "↧": "mapstodown", "↩": "larrhk", "↪": "rarrhk", "↫": "larrlp", "↬": "rarrlp", "↭": "harrw", "↰": "lsh", "↱": "rsh", "↲": "ldsh", "↳": "rdsh", "↵": "crarr", "↶": "cularr", "↷": "curarr", "↺": "olarr", "↻": "orarr", "↼": "lharu", "↽": "lhard", "↾": "uharr", "↿": "uharl", "⇀": "rharu", "⇁": "rhard", "⇂": "dharr", "⇃": "dharl", "⇄": "rlarr", "⇅": "udarr", "⇆": "lrarr", "⇇": "llarr", "⇈": "uuarr", "⇉": "rrarr", "⇊": "ddarr", "⇋": "lrhar", "⇌": "rlhar", "⇐": "lArr", "⇍": "nlArr", "⇑": "uArr", "⇒": "rArr", "⇏": "nrArr", "⇓": "dArr", "⇔": "iff", "⇎": "nhArr", "⇕": "vArr", "⇖": "nwArr", "⇗": "neArr", "⇘": "seArr", "⇙": "swArr", "⇚": "lAarr", "⇛": "rAarr", "⇝": "zigrarr", "⇤": "larrb", "⇥": "rarrb", "⇵": "duarr", "⇽": "loarr", "⇾": "roarr", "⇿": "hoarr", "∀": "forall", "∁": "comp", "∂": "part", "∂̸": "npart", "∃": "exist", "∄": "nexist", "∅": "empty", "∇": "Del", "∈": "in", "∉": "notin", "∋": "ni", "∌": "notni", "϶": "bepsi", "∏": "prod", "∐": "coprod", "∑": "sum", "+": "plus", "±": "pm", "÷": "div", "×": "times", "<": "lt", "≮": "nlt", "<⃒": "nvlt", "=": "equals", "≠": "ne", "=⃥": "bne", "⩵": "Equal", ">": "gt", "≯": "ngt", ">⃒": "nvgt", "¬": "not", "|": "vert", "¦": "brvbar", "−": "minus", "∓": "mp", "∔": "plusdo", "⁄": "frasl", "∖": "setmn", "∗": "lowast", "∘": "compfn", "√": "Sqrt", "∝": "prop", "∞": "infin", "∟": "angrt", "∠": "ang", "∠⃒": "nang", "∡": "angmsd", "∢": "angsph", "∣": "mid", "∤": "nmid", "∥": "par", "∦": "npar", "∧": "and", "∨": "or", "∩": "cap", "∩︀": "caps", "∪": "cup", "∪︀": "cups", "∫": "int", "∬": "Int", "∭": "tint", "⨌": "qint", "∮": "oint", "∯": "Conint", "∰": "Cconint", "∱": "cwint", "∲": "cwconint", "∳": "awconint", "∴": "there4", "∵": "becaus", "∶": "ratio", "∷": "Colon", "∸": "minusd", "∺": "mDDot", "∻": "homtht", "∼": "sim", "≁": "nsim", "∼⃒": "nvsim", "∽": "bsim", "∽̱": "race", "∾": "ac", "∾̳": "acE", "∿": "acd", "≀": "wr", "≂": "esim", "≂̸": "nesim", "≃": "sime", "≄": "nsime", "≅": "cong", "≇": "ncong", "≆": "simne", "≈": "ap", "≉": "nap", "≊": "ape", "≋": "apid", "≋̸": "napid", "≌": "bcong", "≍": "CupCap", "≭": "NotCupCap", "≍⃒": "nvap", "≎": "bump", "≎̸": "nbump", "≏": "bumpe", "≏̸": "nbumpe", "≐": "doteq", "≐̸": "nedot", "≑": "eDot", "≒": "efDot", "≓": "erDot", "≔": "colone", "≕": "ecolon", "≖": "ecir", "≗": "cire", "≙": "wedgeq", "≚": "veeeq", "≜": "trie", "≟": "equest", "≡": "equiv", "≢": "nequiv", "≡⃥": "bnequiv", "≤": "le", "≰": "nle", "≤⃒": "nvle", "≥": "ge", "≱": "nge", "≥⃒": "nvge", "≦": "lE", "≦̸": "nlE", "≧": "gE", "≧̸": "ngE", "≨︀": "lvnE", "≨": "lnE", "≩": "gnE", "≩︀": "gvnE", "≪": "ll", "≪̸": "nLtv", "≪⃒": "nLt", "≫": "gg", "≫̸": "nGtv", "≫⃒": "nGt", "≬": "twixt", "≲": "lsim", "≴": "nlsim", "≳": "gsim", "≵": "ngsim", "≶": "lg", "≸": "ntlg", "≷": "gl", "≹": "ntgl", "≺": "pr", "⊀": "npr", "≻": "sc", "⊁": "nsc", "≼": "prcue", "⋠": "nprcue", "≽": "sccue", "⋡": "nsccue", "≾": "prsim", "≿": "scsim", "≿̸": "NotSucceedsTilde", "⊂": "sub", "⊄": "nsub", "⊂⃒": "vnsub", "⊃": "sup", "⊅": "nsup", "⊃⃒": "vnsup", "⊆": "sube", "⊈": "nsube", "⊇": "supe", "⊉": "nsupe", "⊊︀": "vsubne", "⊊": "subne", "⊋︀": "vsupne", "⊋": "supne", "⊍": "cupdot", "⊎": "uplus", "⊏": "sqsub", "⊏̸": "NotSquareSubset", "⊐": "sqsup", "⊐̸": "NotSquareSuperset", "⊑": "sqsube", "⋢": "nsqsube", "⊒": "sqsupe", "⋣": "nsqsupe", "⊓": "sqcap", "⊓︀": "sqcaps", "⊔": "sqcup", "⊔︀": "sqcups", "⊕": "oplus", "⊖": "ominus", "⊗": "otimes", "⊘": "osol", "⊙": "odot", "⊚": "ocir", "⊛": "oast", "⊝": "odash", "⊞": "plusb", "⊟": "minusb", "⊠": "timesb", "⊡": "sdotb", "⊢": "vdash", "⊬": "nvdash", "⊣": "dashv", "⊤": "top", "⊥": "bot", "⊧": "models", "⊨": "vDash", "⊭": "nvDash", "⊩": "Vdash", "⊮": "nVdash", "⊪": "Vvdash", "⊫": "VDash", "⊯": "nVDash", "⊰": "prurel", "⊲": "vltri", "⋪": "nltri", "⊳": "vrtri", "⋫": "nrtri", "⊴": "ltrie", "⋬": "nltrie", "⊴⃒": "nvltrie", "⊵": "rtrie", "⋭": "nrtrie", "⊵⃒": "nvrtrie", "⊶": "origof", "⊷": "imof", "⊸": "mumap", "⊹": "hercon", "⊺": "intcal", "⊻": "veebar", "⊽": "barvee", "⊾": "angrtvb", "⊿": "lrtri", "⋀": "Wedge", "⋁": "Vee", "⋂": "xcap", "⋃": "xcup", "⋄": "diam", "⋅": "sdot", "⋆": "Star", "⋇": "divonx", "⋈": "bowtie", "⋉": "ltimes", "⋊": "rtimes", "⋋": "lthree", "⋌": "rthree", "⋍": "bsime", "⋎": "cuvee", "⋏": "cuwed", "⋐": "Sub", "⋑": "Sup", "⋒": "Cap", "⋓": "Cup", "⋔": "fork", "⋕": "epar", "⋖": "ltdot", "⋗": "gtdot", "⋘": "Ll", "⋘̸": "nLl", "⋙": "Gg", "⋙̸": "nGg", "⋚︀": "lesg", "⋚": "leg", "⋛": "gel", "⋛︀": "gesl", "⋞": "cuepr", "⋟": "cuesc", "⋦": "lnsim", "⋧": "gnsim", "⋨": "prnsim", "⋩": "scnsim", "⋮": "vellip", "⋯": "ctdot", "⋰": "utdot", "⋱": "dtdot", "⋲": "disin", "⋳": "isinsv", "⋴": "isins", "⋵": "isindot", "⋵̸": "notindot", "⋶": "notinvc", "⋷": "notinvb", "⋹": "isinE", "⋹̸": "notinE", "⋺": "nisd", "⋻": "xnis", "⋼": "nis", "⋽": "notnivc", "⋾": "notnivb", "⌅": "barwed", "⌆": "Barwed", "⌌": "drcrop", "⌍": "dlcrop", "⌎": "urcrop", "⌏": "ulcrop", "⌐": "bnot", "⌒": "profline", "⌓": "profsurf", "⌕": "telrec", "⌖": "target", "⌜": "ulcorn", "⌝": "urcorn", "⌞": "dlcorn", "⌟": "drcorn", "⌢": "frown", "⌣": "smile", "⌭": "cylcty", "⌮": "profalar", "⌶": "topbot", "⌽": "ovbar", "⌿": "solbar", "⍼": "angzarr", "⎰": "lmoust", "⎱": "rmoust", "⎴": "tbrk", "⎵": "bbrk", "⎶": "bbrktbrk", "⏜": "OverParenthesis", "⏝": "UnderParenthesis", "⏞": "OverBrace", "⏟": "UnderBrace", "⏢": "trpezium", "⏧": "elinters", "␣": "blank", "─": "boxh", "│": "boxv", "┌": "boxdr", "┐": "boxdl", "└": "boxur", "┘": "boxul", "├": "boxvr", "┤": "boxvl", "┬": "boxhd", "┴": "boxhu", "┼": "boxvh", "═": "boxH", "║": "boxV", "╒": "boxdR", "╓": "boxDr", "╔": "boxDR", "╕": "boxdL", "╖": "boxDl", "╗": "boxDL", "╘": "boxuR", "╙": "boxUr", "╚": "boxUR", "╛": "boxuL", "╜": "boxUl", "╝": "boxUL", "╞": "boxvR", "╟": "boxVr", "╠": "boxVR", "╡": "boxvL", "╢": "boxVl", "╣": "boxVL", "╤": "boxHd", "╥": "boxhD", "╦": "boxHD", "╧": "boxHu", "╨": "boxhU", "╩": "boxHU", "╪": "boxvH", "╫": "boxVh", "╬": "boxVH", "▀": "uhblk", "▄": "lhblk", "█": "block", "░": "blk14", "▒": "blk12", "▓": "blk34", "□": "squ", "▪": "squf", "▫": "EmptyVerySmallSquare", "▭": "rect", "▮": "marker", "▱": "fltns", "△": "xutri", "▴": "utrif", "▵": "utri", "▸": "rtrif", "▹": "rtri", "▽": "xdtri", "▾": "dtrif", "▿": "dtri", "◂": "ltrif", "◃": "ltri", "◊": "loz", "○": "cir", "◬": "tridot", "◯": "xcirc", "◸": "ultri", "◹": "urtri", "◺": "lltri", "◻": "EmptySmallSquare", "◼": "FilledSmallSquare", "★": "starf", "☆": "star", "☎": "phone", "♀": "female", "♂": "male", "♠": "spades", "♣": "clubs", "♥": "hearts", "♦": "diams", "♪": "sung", "✓": "check", "✗": "cross", "✠": "malt", "✶": "sext", "❘": "VerticalSeparator", "⟈": "bsolhsub", "⟉": "suphsol", "⟵": "xlarr", "⟶": "xrarr", "⟷": "xharr", "⟸": "xlArr", "⟹": "xrArr", "⟺": "xhArr", "⟼": "xmap", "⟿": "dzigrarr", "⤂": "nvlArr", "⤃": "nvrArr", "⤄": "nvHarr", "⤅": "Map", "⤌": "lbarr", "⤍": "rbarr", "⤎": "lBarr", "⤏": "rBarr", "⤐": "RBarr", "⤑": "DDotrahd", "⤒": "UpArrowBar", "⤓": "DownArrowBar", "⤖": "Rarrtl", "⤙": "latail", "⤚": "ratail", "⤛": "lAtail", "⤜": "rAtail", "⤝": "larrfs", "⤞": "rarrfs", "⤟": "larrbfs", "⤠": "rarrbfs", "⤣": "nwarhk", "⤤": "nearhk", "⤥": "searhk", "⤦": "swarhk", "⤧": "nwnear", "⤨": "toea", "⤩": "tosa", "⤪": "swnwar", "⤳": "rarrc", "⤳̸": "nrarrc", "⤵": "cudarrr", "⤶": "ldca", "⤷": "rdca", "⤸": "cudarrl", "⤹": "larrpl", "⤼": "curarrm", "⤽": "cularrp", "⥅": "rarrpl", "⥈": "harrcir", "⥉": "Uarrocir", "⥊": "lurdshar", "⥋": "ldrushar", "⥎": "LeftRightVector", "⥏": "RightUpDownVector", "⥐": "DownLeftRightVector", "⥑": "LeftUpDownVector", "⥒": "LeftVectorBar", "⥓": "RightVectorBar", "⥔": "RightUpVectorBar", "⥕": "RightDownVectorBar", "⥖": "DownLeftVectorBar", "⥗": "DownRightVectorBar", "⥘": "LeftUpVectorBar", "⥙": "LeftDownVectorBar", "⥚": "LeftTeeVector", "⥛": "RightTeeVector", "⥜": "RightUpTeeVector", "⥝": "RightDownTeeVector", "⥞": "DownLeftTeeVector", "⥟": "DownRightTeeVector", "⥠": "LeftUpTeeVector", "⥡": "LeftDownTeeVector", "⥢": "lHar", "⥣": "uHar", "⥤": "rHar", "⥥": "dHar", "⥦": "luruhar", "⥧": "ldrdhar", "⥨": "ruluhar", "⥩": "rdldhar", "⥪": "lharul", "⥫": "llhard", "⥬": "rharul", "⥭": "lrhard", "⥮": "udhar", "⥯": "duhar", "⥰": "RoundImplies", "⥱": "erarr", "⥲": "simrarr", "⥳": "larrsim", "⥴": "rarrsim", "⥵": "rarrap", "⥶": "ltlarr", "⥸": "gtrarr", "⥹": "subrarr", "⥻": "suplarr", "⥼": "lfisht", "⥽": "rfisht", "⥾": "ufisht", "⥿": "dfisht", "⦚": "vzigzag", "⦜": "vangrt", "⦝": "angrtvbd", "⦤": "ange", "⦥": "range", "⦦": "dwangle", "⦧": "uwangle", "⦨": "angmsdaa", "⦩": "angmsdab", "⦪": "angmsdac", "⦫": "angmsdad", "⦬": "angmsdae", "⦭": "angmsdaf", "⦮": "angmsdag", "⦯": "angmsdah", "⦰": "bemptyv", "⦱": "demptyv", "⦲": "cemptyv", "⦳": "raemptyv", "⦴": "laemptyv", "⦵": "ohbar", "⦶": "omid", "⦷": "opar", "⦹": "operp", "⦻": "olcross", "⦼": "odsold", "⦾": "olcir", "⦿": "ofcir", "⧀": "olt", "⧁": "ogt", "⧂": "cirscir", "⧃": "cirE", "⧄": "solb", "⧅": "bsolb", "⧉": "boxbox", "⧍": "trisb", "⧎": "rtriltri", "⧏": "LeftTriangleBar", "⧏̸": "NotLeftTriangleBar", "⧐": "RightTriangleBar", "⧐̸": "NotRightTriangleBar", "⧜": "iinfin", "⧝": "infintie", "⧞": "nvinfin", "⧣": "eparsl", "⧤": "smeparsl", "⧥": "eqvparsl", "⧫": "lozf", "⧴": "RuleDelayed", "⧶": "dsol", "⨀": "xodot", "⨁": "xoplus", "⨂": "xotime", "⨄": "xuplus", "⨆": "xsqcup", "⨍": "fpartint", "⨐": "cirfnint", "⨑": "awint", "⨒": "rppolint", "⨓": "scpolint", "⨔": "npolint", "⨕": "pointint", "⨖": "quatint", "⨗": "intlarhk", "⨢": "pluscir", "⨣": "plusacir", "⨤": "simplus", "⨥": "plusdu", "⨦": "plussim", "⨧": "plustwo", "⨩": "mcomma", "⨪": "minusdu", "⨭": "loplus", "⨮": "roplus", "⨯": "Cross", "⨰": "timesd", "⨱": "timesbar", "⨳": "smashp", "⨴": "lotimes", "⨵": "rotimes", "⨶": "otimesas", "⨷": "Otimes", "⨸": "odiv", "⨹": "triplus", "⨺": "triminus", "⨻": "tritime", "⨼": "iprod", "⨿": "amalg", "⩀": "capdot", "⩂": "ncup", "⩃": "ncap", "⩄": "capand", "⩅": "cupor", "⩆": "cupcap", "⩇": "capcup", "⩈": "cupbrcap", "⩉": "capbrcup", "⩊": "cupcup", "⩋": "capcap", "⩌": "ccups", "⩍": "ccaps", "⩐": "ccupssm", "⩓": "And", "⩔": "Or", "⩕": "andand", "⩖": "oror", "⩗": "orslope", "⩘": "andslope", "⩚": "andv", "⩛": "orv", "⩜": "andd", "⩝": "ord", "⩟": "wedbar", "⩦": "sdote", "⩪": "simdot", "⩭": "congdot", "⩭̸": "ncongdot", "⩮": "easter", "⩯": "apacir", "⩰": "apE", "⩰̸": "napE", "⩱": "eplus", "⩲": "pluse", "⩳": "Esim", "⩷": "eDDot", "⩸": "equivDD", "⩹": "ltcir", "⩺": "gtcir", "⩻": "ltquest", "⩼": "gtquest", "⩽": "les", "⩽̸": "nles", "⩾": "ges", "⩾̸": "nges", "⩿": "lesdot", "⪀": "gesdot", "⪁": "lesdoto", "⪂": "gesdoto", "⪃": "lesdotor", "⪄": "gesdotol", "⪅": "lap", "⪆": "gap", "⪇": "lne", "⪈": "gne", "⪉": "lnap", "⪊": "gnap", "⪋": "lEg", "⪌": "gEl", "⪍": "lsime", "⪎": "gsime", "⪏": "lsimg", "⪐": "gsiml", "⪑": "lgE", "⪒": "glE", "⪓": "lesges", "⪔": "gesles", "⪕": "els", "⪖": "egs", "⪗": "elsdot", "⪘": "egsdot", "⪙": "el", "⪚": "eg", "⪝": "siml", "⪞": "simg", "⪟": "simlE", "⪠": "simgE", "⪡": "LessLess", "⪡̸": "NotNestedLessLess", "⪢": "GreaterGreater", "⪢̸": "NotNestedGreaterGreater", "⪤": "glj", "⪥": "gla", "⪦": "ltcc", "⪧": "gtcc", "⪨": "lescc", "⪩": "gescc", "⪪": "smt", "⪫": "lat", "⪬": "smte", "⪬︀": "smtes", "⪭": "late", "⪭︀": "lates", "⪮": "bumpE", "⪯": "pre", "⪯̸": "npre", "⪰": "sce", "⪰̸": "nsce", "⪳": "prE", "⪴": "scE", "⪵": "prnE", "⪶": "scnE", "⪷": "prap", "⪸": "scap", "⪹": "prnap", "⪺": "scnap", "⪻": "Pr", "⪼": "Sc", "⪽": "subdot", "⪾": "supdot", "⪿": "subplus", "⫀": "supplus", "⫁": "submult", "⫂": "supmult", "⫃": "subedot", "⫄": "supedot", "⫅": "subE", "⫅̸": "nsubE", "⫆": "supE", "⫆̸": "nsupE", "⫇": "subsim", "⫈": "supsim", "⫋︀": "vsubnE", "⫋": "subnE", "⫌︀": "vsupnE", "⫌": "supnE", "⫏": "csub", "⫐": "csup", "⫑": "csube", "⫒": "csupe", "⫓": "subsup", "⫔": "supsub", "⫕": "subsub", "⫖": "supsup", "⫗": "suphsub", "⫘": "supdsub", "⫙": "forkv", "⫚": "topfork", "⫛": "mlcp", "⫤": "Dashv", "⫦": "Vdashl", "⫧": "Barv", "⫨": "vBar", "⫩": "vBarv", "⫫": "Vbar", "⫬": "Not", "⫭": "bNot", "⫮": "rnmid", "⫯": "cirmid", "⫰": "midcir", "⫱": "topcir", "⫲": "nhpar", "⫳": "parsim", "⫽": "parsl", "⫽⃥": "nparsl", "♭": "flat", "♮": "natur", "♯": "sharp", "¤": "curren", "¢": "cent", "$": "dollar", "£": "pound", "¥": "yen", "€": "euro", "¹": "sup1", "½": "half", "⅓": "frac13", "¼": "frac14", "⅕": "frac15", "⅙": "frac16", "⅛": "frac18", "²": "sup2", "⅔": "frac23", "⅖": "frac25", "³": "sup3", "¾": "frac34", "⅗": "frac35", "⅜": "frac38", "⅘": "frac45", "⅚": "frac56", "⅝": "frac58", "⅞": "frac78", "𝒶": "ascr", "𝕒": "aopf", "𝔞": "afr", "𝔸": "Aopf", "𝔄": "Afr", "𝒜": "Ascr", "ª": "ordf", "á": "aacute", "Á": "Aacute", "à": "agrave", "À": "Agrave", "ă": "abreve", "Ă": "Abreve", "â": "acirc", "Â": "Acirc", "å": "aring", "Å": "angst", "ä": "auml", "Ä": "Auml", "ã": "atilde", "Ã": "Atilde", "ą": "aogon", "Ą": "Aogon", "ā": "amacr", "Ā": "Amacr", "æ": "aelig", "Æ": "AElig", "𝒷": "bscr", "𝕓": "bopf", "𝔟": "bfr", "𝔹": "Bopf", "ℬ": "Bscr", "𝔅": "Bfr", "𝔠": "cfr", "𝒸": "cscr", "𝕔": "copf", "ℭ": "Cfr", "𝒞": "Cscr", "ℂ": "Copf", "ć": "cacute", "Ć": "Cacute", "ĉ": "ccirc", "Ĉ": "Ccirc", "č": "ccaron", "Č": "Ccaron", "ċ": "cdot", "Ċ": "Cdot", "ç": "ccedil", "Ç": "Ccedil", "℅": "incare", "𝔡": "dfr", "ⅆ": "dd", "𝕕": "dopf", "𝒹": "dscr", "𝒟": "Dscr", "𝔇": "Dfr", "ⅅ": "DD", "𝔻": "Dopf", "ď": "dcaron", "Ď": "Dcaron", "đ": "dstrok", "Đ": "Dstrok", "ð": "eth", "Ð": "ETH", "ⅇ": "ee", "ℯ": "escr", "𝔢": "efr", "𝕖": "eopf", "ℰ": "Escr", "𝔈": "Efr", "𝔼": "Eopf", "é": "eacute", "É": "Eacute", "è": "egrave", "È": "Egrave", "ê": "ecirc", "Ê": "Ecirc", "ě": "ecaron", "Ě": "Ecaron", "ë": "euml", "Ë": "Euml", "ė": "edot", "Ė": "Edot", "ę": "eogon", "Ę": "Eogon", "ē": "emacr", "Ē": "Emacr", "𝔣": "ffr", "𝕗": "fopf", "𝒻": "fscr", "𝔉": "Ffr", "𝔽": "Fopf", "ℱ": "Fscr", "ﬀ": "fflig", "ﬃ": "ffilig", "ﬄ": "ffllig", "ﬁ": "filig", "fj": "fjlig", "ﬂ": "fllig", "ƒ": "fnof", "ℊ": "gscr", "𝕘": "gopf", "𝔤": "gfr", "𝒢": "Gscr", "𝔾": "Gopf", "𝔊": "Gfr", "ǵ": "gacute", "ğ": "gbreve", "Ğ": "Gbreve", "ĝ": "gcirc", "Ĝ": "Gcirc", "ġ": "gdot", "Ġ": "Gdot", "Ģ": "Gcedil", "𝔥": "hfr", "ℎ": "planckh", "𝒽": "hscr", "𝕙": "hopf", "ℋ": "Hscr", "ℌ": "Hfr", "ℍ": "Hopf", "ĥ": "hcirc", "Ĥ": "Hcirc", "ℏ": "hbar", "ħ": "hstrok", "Ħ": "Hstrok", "𝕚": "iopf", "𝔦": "ifr", "𝒾": "iscr", "ⅈ": "ii", "𝕀": "Iopf", "ℐ": "Iscr", "ℑ": "Im", "í": "iacute", "Í": "Iacute", "ì": "igrave", "Ì": "Igrave", "î": "icirc", "Î": "Icirc", "ï": "iuml", "Ï": "Iuml", "ĩ": "itilde", "Ĩ": "Itilde", "İ": "Idot", "į": "iogon", "Į": "Iogon", "ī": "imacr", "Ī": "Imacr", "ĳ": "ijlig", "Ĳ": "IJlig", "ı": "imath", "𝒿": "jscr", "𝕛": "jopf", "𝔧": "jfr", "𝒥": "Jscr", "𝔍": "Jfr", "𝕁": "Jopf", "ĵ": "jcirc", "Ĵ": "Jcirc", "ȷ": "jmath", "𝕜": "kopf", "𝓀": "kscr", "𝔨": "kfr", "𝒦": "Kscr", "𝕂": "Kopf", "𝔎": "Kfr", "ķ": "kcedil", "Ķ": "Kcedil", "𝔩": "lfr", "𝓁": "lscr", "ℓ": "ell", "𝕝": "lopf", "ℒ": "Lscr", "𝔏": "Lfr", "𝕃": "Lopf", "ĺ": "lacute", "Ĺ": "Lacute", "ľ": "lcaron", "Ľ": "Lcaron", "ļ": "lcedil", "Ļ": "Lcedil", "ł": "lstrok", "Ł": "Lstrok", "ŀ": "lmidot", "Ŀ": "Lmidot", "𝔪": "mfr", "𝕞": "mopf", "𝓂": "mscr", "𝔐": "Mfr", "𝕄": "Mopf", "ℳ": "Mscr", "𝔫": "nfr", "𝕟": "nopf", "𝓃": "nscr", "ℕ": "Nopf", "𝒩": "Nscr", "𝔑": "Nfr", "ń": "nacute", "Ń": "Nacute", "ň": "ncaron", "Ň": "Ncaron", "ñ": "ntilde", "Ñ": "Ntilde", "ņ": "ncedil", "Ņ": "Ncedil", "№": "numero", "ŋ": "eng", "Ŋ": "ENG", "𝕠": "oopf", "𝔬": "ofr", "ℴ": "oscr", "𝒪": "Oscr", "𝔒": "Ofr", "𝕆": "Oopf", "º": "ordm", "ó": "oacute", "Ó": "Oacute", "ò": "ograve", "Ò": "Ograve", "ô": "ocirc", "Ô": "Ocirc", "ö": "ouml", "Ö": "Ouml", "ő": "odblac", "Ő": "Odblac", "õ": "otilde", "Õ": "Otilde", "ø": "oslash", "Ø": "Oslash", "ō": "omacr", "Ō": "Omacr", "œ": "oelig", "Œ": "OElig", "𝔭": "pfr", "𝓅": "pscr", "𝕡": "popf", "ℙ": "Popf", "𝔓": "Pfr", "𝒫": "Pscr", "𝕢": "qopf", "𝔮": "qfr", "𝓆": "qscr", "𝒬": "Qscr", "𝔔": "Qfr", "ℚ": "Qopf", "ĸ": "kgreen", "𝔯": "rfr", "𝕣": "ropf", "𝓇": "rscr", "ℛ": "Rscr", "ℜ": "Re", "ℝ": "Ropf", "ŕ": "racute", "Ŕ": "Racute", "ř": "rcaron", "Ř": "Rcaron", "ŗ": "rcedil", "Ŗ": "Rcedil", "𝕤": "sopf", "𝓈": "sscr", "𝔰": "sfr", "𝕊": "Sopf", "𝔖": "Sfr", "𝒮": "Sscr", "Ⓢ": "oS", "ś": "sacute", "Ś": "Sacute", "ŝ": "scirc", "Ŝ": "Scirc", "š": "scaron", "Š": "Scaron", "ş": "scedil", "Ş": "Scedil", "ß": "szlig", "𝔱": "tfr", "𝓉": "tscr", "𝕥": "topf", "𝒯": "Tscr", "𝔗": "Tfr", "𝕋": "Topf", "ť": "tcaron", "Ť": "Tcaron", "ţ": "tcedil", "Ţ": "Tcedil", "™": "trade", "ŧ": "tstrok", "Ŧ": "Tstrok", "𝓊": "uscr", "𝕦": "uopf", "𝔲": "ufr", "𝕌": "Uopf", "𝔘": "Ufr", "𝒰": "Uscr", "ú": "uacute", "Ú": "Uacute", "ù": "ugrave", "Ù": "Ugrave", "ŭ": "ubreve", "Ŭ": "Ubreve", "û": "ucirc", "Û": "Ucirc", "ů": "uring", "Ů": "Uring", "ü": "uuml", "Ü": "Uuml", "ű": "udblac", "Ű": "Udblac", "ũ": "utilde", "Ũ": "Utilde", "ų": "uogon", "Ų": "Uogon", "ū": "umacr", "Ū": "Umacr", "𝔳": "vfr", "𝕧": "vopf", "𝓋": "vscr", "𝔙": "Vfr", "𝕍": "Vopf", "𝒱": "Vscr", "𝕨": "wopf", "𝓌": "wscr", "𝔴": "wfr", "𝒲": "Wscr", "𝕎": "Wopf", "𝔚": "Wfr", "ŵ": "wcirc", "Ŵ": "Wcirc", "𝔵": "xfr", "𝓍": "xscr", "𝕩": "xopf", "𝕏": "Xopf", "𝔛": "Xfr", "𝒳": "Xscr", "𝔶": "yfr", "𝓎": "yscr", "𝕪": "yopf", "𝒴": "Yscr", "𝔜": "Yfr", "𝕐": "Yopf", "ý": "yacute", "Ý": "Yacute", "ŷ": "ycirc", "Ŷ": "Ycirc", "ÿ": "yuml", "Ÿ": "Yuml", "𝓏": "zscr", "𝔷": "zfr", "𝕫": "zopf", "ℨ": "Zfr", "ℤ": "Zopf", "𝒵": "Zscr", "ź": "zacute", "Ź": "Zacute", "ž": "zcaron", "Ž": "Zcaron", "ż": "zdot", "Ż": "Zdot", "Ƶ": "imped", "þ": "thorn", "Þ": "THORN", "ŉ": "napos", "α": "alpha", "Α": "Alpha", "β": "beta", "Β": "Beta", "γ": "gamma", "Γ": "Gamma", "δ": "delta", "Δ": "Delta", "ε": "epsi", "ϵ": "epsiv", "Ε": "Epsilon", "ϝ": "gammad", "Ϝ": "Gammad", "ζ": "zeta", "Ζ": "Zeta", "η": "eta", "Η": "Eta", "θ": "theta", "ϑ": "thetav", "Θ": "Theta", "ι": "iota", "Ι": "Iota", "κ": "kappa", "ϰ": "kappav", "Κ": "Kappa", "λ": "lambda", "Λ": "Lambda", "μ": "mu", "µ": "micro", "Μ": "Mu", "ν": "nu", "Ν": "Nu", "ξ": "xi", "Ξ": "Xi", "ο": "omicron", "Ο": "Omicron", "π": "pi", "ϖ": "piv", "Π": "Pi", "ρ": "rho", "ϱ": "rhov", "Ρ": "Rho", "σ": "sigma", "Σ": "Sigma", "ς": "sigmaf", "τ": "tau", "Τ": "Tau", "υ": "upsi", "Υ": "Upsilon", "ϒ": "Upsi", "φ": "phi", "ϕ": "phiv", "Φ": "Phi", "χ": "chi", "Χ": "Chi", "ψ": "psi", "Ψ": "Psi", "ω": "omega", "Ω": "ohm", "а": "acy", "А": "Acy", "б": "bcy", "Б": "Bcy", "в": "vcy", "В": "Vcy", "г": "gcy", "Г": "Gcy", "ѓ": "gjcy", "Ѓ": "GJcy", "д": "dcy", "Д": "Dcy", "ђ": "djcy", "Ђ": "DJcy", "е": "iecy", "Е": "IEcy", "ё": "iocy", "Ё": "IOcy", "є": "jukcy", "Є": "Jukcy", "ж": "zhcy", "Ж": "ZHcy", "з": "zcy", "З": "Zcy", "ѕ": "dscy", "Ѕ": "DScy", "и": "icy", "И": "Icy", "і": "iukcy", "І": "Iukcy", "ї": "yicy", "Ї": "YIcy", "й": "jcy", "Й": "Jcy", "ј": "jsercy", "Ј": "Jsercy", "к": "kcy", "К": "Kcy", "ќ": "kjcy", "Ќ": "KJcy", "л": "lcy", "Л": "Lcy", "љ": "ljcy", "Љ": "LJcy", "м": "mcy", "М": "Mcy", "н": "ncy", "Н": "Ncy", "њ": "njcy", "Њ": "NJcy", "о": "ocy", "О": "Ocy", "п": "pcy", "П": "Pcy", "р": "rcy", "Р": "Rcy", "с": "scy", "С": "Scy", "т": "tcy", "Т": "Tcy", "ћ": "tshcy", "Ћ": "TSHcy", "у": "ucy", "У": "Ucy", "ў": "ubrcy", "Ў": "Ubrcy", "ф": "fcy", "Ф": "Fcy", "х": "khcy", "Х": "KHcy", "ц": "tscy", "Ц": "TScy", "ч": "chcy", "Ч": "CHcy", "џ": "dzcy", "Џ": "DZcy", "ш": "shcy", "Ш": "SHcy", "щ": "shchcy", "Щ": "SHCHcy", "ъ": "hardcy", "Ъ": "HARDcy", "ы": "ycy", "Ы": "Ycy", "ь": "softcy", "Ь": "SOFTcy", "э": "ecy", "Э": "Ecy", "ю": "yucy", "Ю": "YUcy", "я": "yacy", "Я": "YAcy", "ℵ": "aleph", "ℶ": "beth", "ℷ": "gimel", "ℸ": "daleth" };
    var regexEscape = /["&'<>`]/g;
    var escapeMap = {
      '"': "&quot;",
      "&": "&amp;",
      "'": "&#x27;",
      "<": "&lt;",
      // See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
      // following is not strictly necessary unless it’s part of a tag or an
      // unquoted attribute value. We’re only escaping it to support those
      // situations, and for XML support.
      ">": "&gt;",
      // In Internet Explorer ≤ 8, the backtick character can be used
      // to break out of (un)quoted attribute values or HTML comments.
      // See http://html5sec.org/#102, http://html5sec.org/#108, and
      // http://html5sec.org/#133.
      "`": "&#x60;"
    };
    var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
    var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
    var decodeMap = { "aacute": "á", "Aacute": "Á", "abreve": "ă", "Abreve": "Ă", "ac": "∾", "acd": "∿", "acE": "∾̳", "acirc": "â", "Acirc": "Â", "acute": "´", "acy": "а", "Acy": "А", "aelig": "æ", "AElig": "Æ", "af": "⁡", "afr": "𝔞", "Afr": "𝔄", "agrave": "à", "Agrave": "À", "alefsym": "ℵ", "aleph": "ℵ", "alpha": "α", "Alpha": "Α", "amacr": "ā", "Amacr": "Ā", "amalg": "⨿", "amp": "&", "AMP": "&", "and": "∧", "And": "⩓", "andand": "⩕", "andd": "⩜", "andslope": "⩘", "andv": "⩚", "ang": "∠", "ange": "⦤", "angle": "∠", "angmsd": "∡", "angmsdaa": "⦨", "angmsdab": "⦩", "angmsdac": "⦪", "angmsdad": "⦫", "angmsdae": "⦬", "angmsdaf": "⦭", "angmsdag": "⦮", "angmsdah": "⦯", "angrt": "∟", "angrtvb": "⊾", "angrtvbd": "⦝", "angsph": "∢", "angst": "Å", "angzarr": "⍼", "aogon": "ą", "Aogon": "Ą", "aopf": "𝕒", "Aopf": "𝔸", "ap": "≈", "apacir": "⩯", "ape": "≊", "apE": "⩰", "apid": "≋", "apos": "'", "ApplyFunction": "⁡", "approx": "≈", "approxeq": "≊", "aring": "å", "Aring": "Å", "ascr": "𝒶", "Ascr": "𝒜", "Assign": "≔", "ast": "*", "asymp": "≈", "asympeq": "≍", "atilde": "ã", "Atilde": "Ã", "auml": "ä", "Auml": "Ä", "awconint": "∳", "awint": "⨑", "backcong": "≌", "backepsilon": "϶", "backprime": "‵", "backsim": "∽", "backsimeq": "⋍", "Backslash": "∖", "Barv": "⫧", "barvee": "⊽", "barwed": "⌅", "Barwed": "⌆", "barwedge": "⌅", "bbrk": "⎵", "bbrktbrk": "⎶", "bcong": "≌", "bcy": "б", "Bcy": "Б", "bdquo": "„", "becaus": "∵", "because": "∵", "Because": "∵", "bemptyv": "⦰", "bepsi": "϶", "bernou": "ℬ", "Bernoullis": "ℬ", "beta": "β", "Beta": "Β", "beth": "ℶ", "between": "≬", "bfr": "𝔟", "Bfr": "𝔅", "bigcap": "⋂", "bigcirc": "◯", "bigcup": "⋃", "bigodot": "⨀", "bigoplus": "⨁", "bigotimes": "⨂", "bigsqcup": "⨆", "bigstar": "★", "bigtriangledown": "▽", "bigtriangleup": "△", "biguplus": "⨄", "bigvee": "⋁", "bigwedge": "⋀", "bkarow": "⤍", "blacklozenge": "⧫", "blacksquare": "▪", "blacktriangle": "▴", "blacktriangledown": "▾", "blacktriangleleft": "◂", "blacktriangleright": "▸", "blank": "␣", "blk12": "▒", "blk14": "░", "blk34": "▓", "block": "█", "bne": "=⃥", "bnequiv": "≡⃥", "bnot": "⌐", "bNot": "⫭", "bopf": "𝕓", "Bopf": "𝔹", "bot": "⊥", "bottom": "⊥", "bowtie": "⋈", "boxbox": "⧉", "boxdl": "┐", "boxdL": "╕", "boxDl": "╖", "boxDL": "╗", "boxdr": "┌", "boxdR": "╒", "boxDr": "╓", "boxDR": "╔", "boxh": "─", "boxH": "═", "boxhd": "┬", "boxhD": "╥", "boxHd": "╤", "boxHD": "╦", "boxhu": "┴", "boxhU": "╨", "boxHu": "╧", "boxHU": "╩", "boxminus": "⊟", "boxplus": "⊞", "boxtimes": "⊠", "boxul": "┘", "boxuL": "╛", "boxUl": "╜", "boxUL": "╝", "boxur": "└", "boxuR": "╘", "boxUr": "╙", "boxUR": "╚", "boxv": "│", "boxV": "║", "boxvh": "┼", "boxvH": "╪", "boxVh": "╫", "boxVH": "╬", "boxvl": "┤", "boxvL": "╡", "boxVl": "╢", "boxVL": "╣", "boxvr": "├", "boxvR": "╞", "boxVr": "╟", "boxVR": "╠", "bprime": "‵", "breve": "˘", "Breve": "˘", "brvbar": "¦", "bscr": "𝒷", "Bscr": "ℬ", "bsemi": "⁏", "bsim": "∽", "bsime": "⋍", "bsol": "\\", "bsolb": "⧅", "bsolhsub": "⟈", "bull": "•", "bullet": "•", "bump": "≎", "bumpe": "≏", "bumpE": "⪮", "bumpeq": "≏", "Bumpeq": "≎", "cacute": "ć", "Cacute": "Ć", "cap": "∩", "Cap": "⋒", "capand": "⩄", "capbrcup": "⩉", "capcap": "⩋", "capcup": "⩇", "capdot": "⩀", "CapitalDifferentialD": "ⅅ", "caps": "∩︀", "caret": "⁁", "caron": "ˇ", "Cayleys": "ℭ", "ccaps": "⩍", "ccaron": "č", "Ccaron": "Č", "ccedil": "ç", "Ccedil": "Ç", "ccirc": "ĉ", "Ccirc": "Ĉ", "Cconint": "∰", "ccups": "⩌", "ccupssm": "⩐", "cdot": "ċ", "Cdot": "Ċ", "cedil": "¸", "Cedilla": "¸", "cemptyv": "⦲", "cent": "¢", "centerdot": "·", "CenterDot": "·", "cfr": "𝔠", "Cfr": "ℭ", "chcy": "ч", "CHcy": "Ч", "check": "✓", "checkmark": "✓", "chi": "χ", "Chi": "Χ", "cir": "○", "circ": "ˆ", "circeq": "≗", "circlearrowleft": "↺", "circlearrowright": "↻", "circledast": "⊛", "circledcirc": "⊚", "circleddash": "⊝", "CircleDot": "⊙", "circledR": "®", "circledS": "Ⓢ", "CircleMinus": "⊖", "CirclePlus": "⊕", "CircleTimes": "⊗", "cire": "≗", "cirE": "⧃", "cirfnint": "⨐", "cirmid": "⫯", "cirscir": "⧂", "ClockwiseContourIntegral": "∲", "CloseCurlyDoubleQuote": "”", "CloseCurlyQuote": "’", "clubs": "♣", "clubsuit": "♣", "colon": ":", "Colon": "∷", "colone": "≔", "Colone": "⩴", "coloneq": "≔", "comma": ",", "commat": "@", "comp": "∁", "compfn": "∘", "complement": "∁", "complexes": "ℂ", "cong": "≅", "congdot": "⩭", "Congruent": "≡", "conint": "∮", "Conint": "∯", "ContourIntegral": "∮", "copf": "𝕔", "Copf": "ℂ", "coprod": "∐", "Coproduct": "∐", "copy": "©", "COPY": "©", "copysr": "℗", "CounterClockwiseContourIntegral": "∳", "crarr": "↵", "cross": "✗", "Cross": "⨯", "cscr": "𝒸", "Cscr": "𝒞", "csub": "⫏", "csube": "⫑", "csup": "⫐", "csupe": "⫒", "ctdot": "⋯", "cudarrl": "⤸", "cudarrr": "⤵", "cuepr": "⋞", "cuesc": "⋟", "cularr": "↶", "cularrp": "⤽", "cup": "∪", "Cup": "⋓", "cupbrcap": "⩈", "cupcap": "⩆", "CupCap": "≍", "cupcup": "⩊", "cupdot": "⊍", "cupor": "⩅", "cups": "∪︀", "curarr": "↷", "curarrm": "⤼", "curlyeqprec": "⋞", "curlyeqsucc": "⋟", "curlyvee": "⋎", "curlywedge": "⋏", "curren": "¤", "curvearrowleft": "↶", "curvearrowright": "↷", "cuvee": "⋎", "cuwed": "⋏", "cwconint": "∲", "cwint": "∱", "cylcty": "⌭", "dagger": "†", "Dagger": "‡", "daleth": "ℸ", "darr": "↓", "dArr": "⇓", "Darr": "↡", "dash": "‐", "dashv": "⊣", "Dashv": "⫤", "dbkarow": "⤏", "dblac": "˝", "dcaron": "ď", "Dcaron": "Ď", "dcy": "д", "Dcy": "Д", "dd": "ⅆ", "DD": "ⅅ", "ddagger": "‡", "ddarr": "⇊", "DDotrahd": "⤑", "ddotseq": "⩷", "deg": "°", "Del": "∇", "delta": "δ", "Delta": "Δ", "demptyv": "⦱", "dfisht": "⥿", "dfr": "𝔡", "Dfr": "𝔇", "dHar": "⥥", "dharl": "⇃", "dharr": "⇂", "DiacriticalAcute": "´", "DiacriticalDot": "˙", "DiacriticalDoubleAcute": "˝", "DiacriticalGrave": "`", "DiacriticalTilde": "˜", "diam": "⋄", "diamond": "⋄", "Diamond": "⋄", "diamondsuit": "♦", "diams": "♦", "die": "¨", "DifferentialD": "ⅆ", "digamma": "ϝ", "disin": "⋲", "div": "÷", "divide": "÷", "divideontimes": "⋇", "divonx": "⋇", "djcy": "ђ", "DJcy": "Ђ", "dlcorn": "⌞", "dlcrop": "⌍", "dollar": "$", "dopf": "𝕕", "Dopf": "𝔻", "dot": "˙", "Dot": "¨", "DotDot": "⃜", "doteq": "≐", "doteqdot": "≑", "DotEqual": "≐", "dotminus": "∸", "dotplus": "∔", "dotsquare": "⊡", "doublebarwedge": "⌆", "DoubleContourIntegral": "∯", "DoubleDot": "¨", "DoubleDownArrow": "⇓", "DoubleLeftArrow": "⇐", "DoubleLeftRightArrow": "⇔", "DoubleLeftTee": "⫤", "DoubleLongLeftArrow": "⟸", "DoubleLongLeftRightArrow": "⟺", "DoubleLongRightArrow": "⟹", "DoubleRightArrow": "⇒", "DoubleRightTee": "⊨", "DoubleUpArrow": "⇑", "DoubleUpDownArrow": "⇕", "DoubleVerticalBar": "∥", "downarrow": "↓", "Downarrow": "⇓", "DownArrow": "↓", "DownArrowBar": "⤓", "DownArrowUpArrow": "⇵", "DownBreve": "̑", "downdownarrows": "⇊", "downharpoonleft": "⇃", "downharpoonright": "⇂", "DownLeftRightVector": "⥐", "DownLeftTeeVector": "⥞", "DownLeftVector": "↽", "DownLeftVectorBar": "⥖", "DownRightTeeVector": "⥟", "DownRightVector": "⇁", "DownRightVectorBar": "⥗", "DownTee": "⊤", "DownTeeArrow": "↧", "drbkarow": "⤐", "drcorn": "⌟", "drcrop": "⌌", "dscr": "𝒹", "Dscr": "𝒟", "dscy": "ѕ", "DScy": "Ѕ", "dsol": "⧶", "dstrok": "đ", "Dstrok": "Đ", "dtdot": "⋱", "dtri": "▿", "dtrif": "▾", "duarr": "⇵", "duhar": "⥯", "dwangle": "⦦", "dzcy": "џ", "DZcy": "Џ", "dzigrarr": "⟿", "eacute": "é", "Eacute": "É", "easter": "⩮", "ecaron": "ě", "Ecaron": "Ě", "ecir": "≖", "ecirc": "ê", "Ecirc": "Ê", "ecolon": "≕", "ecy": "э", "Ecy": "Э", "eDDot": "⩷", "edot": "ė", "eDot": "≑", "Edot": "Ė", "ee": "ⅇ", "efDot": "≒", "efr": "𝔢", "Efr": "𝔈", "eg": "⪚", "egrave": "è", "Egrave": "È", "egs": "⪖", "egsdot": "⪘", "el": "⪙", "Element": "∈", "elinters": "⏧", "ell": "ℓ", "els": "⪕", "elsdot": "⪗", "emacr": "ē", "Emacr": "Ē", "empty": "∅", "emptyset": "∅", "EmptySmallSquare": "◻", "emptyv": "∅", "EmptyVerySmallSquare": "▫", "emsp": " ", "emsp13": " ", "emsp14": " ", "eng": "ŋ", "ENG": "Ŋ", "ensp": " ", "eogon": "ę", "Eogon": "Ę", "eopf": "𝕖", "Eopf": "𝔼", "epar": "⋕", "eparsl": "⧣", "eplus": "⩱", "epsi": "ε", "epsilon": "ε", "Epsilon": "Ε", "epsiv": "ϵ", "eqcirc": "≖", "eqcolon": "≕", "eqsim": "≂", "eqslantgtr": "⪖", "eqslantless": "⪕", "Equal": "⩵", "equals": "=", "EqualTilde": "≂", "equest": "≟", "Equilibrium": "⇌", "equiv": "≡", "equivDD": "⩸", "eqvparsl": "⧥", "erarr": "⥱", "erDot": "≓", "escr": "ℯ", "Escr": "ℰ", "esdot": "≐", "esim": "≂", "Esim": "⩳", "eta": "η", "Eta": "Η", "eth": "ð", "ETH": "Ð", "euml": "ë", "Euml": "Ë", "euro": "€", "excl": "!", "exist": "∃", "Exists": "∃", "expectation": "ℰ", "exponentiale": "ⅇ", "ExponentialE": "ⅇ", "fallingdotseq": "≒", "fcy": "ф", "Fcy": "Ф", "female": "♀", "ffilig": "ﬃ", "fflig": "ﬀ", "ffllig": "ﬄ", "ffr": "𝔣", "Ffr": "𝔉", "filig": "ﬁ", "FilledSmallSquare": "◼", "FilledVerySmallSquare": "▪", "fjlig": "fj", "flat": "♭", "fllig": "ﬂ", "fltns": "▱", "fnof": "ƒ", "fopf": "𝕗", "Fopf": "𝔽", "forall": "∀", "ForAll": "∀", "fork": "⋔", "forkv": "⫙", "Fouriertrf": "ℱ", "fpartint": "⨍", "frac12": "½", "frac13": "⅓", "frac14": "¼", "frac15": "⅕", "frac16": "⅙", "frac18": "⅛", "frac23": "⅔", "frac25": "⅖", "frac34": "¾", "frac35": "⅗", "frac38": "⅜", "frac45": "⅘", "frac56": "⅚", "frac58": "⅝", "frac78": "⅞", "frasl": "⁄", "frown": "⌢", "fscr": "𝒻", "Fscr": "ℱ", "gacute": "ǵ", "gamma": "γ", "Gamma": "Γ", "gammad": "ϝ", "Gammad": "Ϝ", "gap": "⪆", "gbreve": "ğ", "Gbreve": "Ğ", "Gcedil": "Ģ", "gcirc": "ĝ", "Gcirc": "Ĝ", "gcy": "г", "Gcy": "Г", "gdot": "ġ", "Gdot": "Ġ", "ge": "≥", "gE": "≧", "gel": "⋛", "gEl": "⪌", "geq": "≥", "geqq": "≧", "geqslant": "⩾", "ges": "⩾", "gescc": "⪩", "gesdot": "⪀", "gesdoto": "⪂", "gesdotol": "⪄", "gesl": "⋛︀", "gesles": "⪔", "gfr": "𝔤", "Gfr": "𝔊", "gg": "≫", "Gg": "⋙", "ggg": "⋙", "gimel": "ℷ", "gjcy": "ѓ", "GJcy": "Ѓ", "gl": "≷", "gla": "⪥", "glE": "⪒", "glj": "⪤", "gnap": "⪊", "gnapprox": "⪊", "gne": "⪈", "gnE": "≩", "gneq": "⪈", "gneqq": "≩", "gnsim": "⋧", "gopf": "𝕘", "Gopf": "𝔾", "grave": "`", "GreaterEqual": "≥", "GreaterEqualLess": "⋛", "GreaterFullEqual": "≧", "GreaterGreater": "⪢", "GreaterLess": "≷", "GreaterSlantEqual": "⩾", "GreaterTilde": "≳", "gscr": "ℊ", "Gscr": "𝒢", "gsim": "≳", "gsime": "⪎", "gsiml": "⪐", "gt": ">", "Gt": "≫", "GT": ">", "gtcc": "⪧", "gtcir": "⩺", "gtdot": "⋗", "gtlPar": "⦕", "gtquest": "⩼", "gtrapprox": "⪆", "gtrarr": "⥸", "gtrdot": "⋗", "gtreqless": "⋛", "gtreqqless": "⪌", "gtrless": "≷", "gtrsim": "≳", "gvertneqq": "≩︀", "gvnE": "≩︀", "Hacek": "ˇ", "hairsp": " ", "half": "½", "hamilt": "ℋ", "hardcy": "ъ", "HARDcy": "Ъ", "harr": "↔", "hArr": "⇔", "harrcir": "⥈", "harrw": "↭", "Hat": "^", "hbar": "ℏ", "hcirc": "ĥ", "Hcirc": "Ĥ", "hearts": "♥", "heartsuit": "♥", "hellip": "…", "hercon": "⊹", "hfr": "𝔥", "Hfr": "ℌ", "HilbertSpace": "ℋ", "hksearow": "⤥", "hkswarow": "⤦", "hoarr": "⇿", "homtht": "∻", "hookleftarrow": "↩", "hookrightarrow": "↪", "hopf": "𝕙", "Hopf": "ℍ", "horbar": "―", "HorizontalLine": "─", "hscr": "𝒽", "Hscr": "ℋ", "hslash": "ℏ", "hstrok": "ħ", "Hstrok": "Ħ", "HumpDownHump": "≎", "HumpEqual": "≏", "hybull": "⁃", "hyphen": "‐", "iacute": "í", "Iacute": "Í", "ic": "⁣", "icirc": "î", "Icirc": "Î", "icy": "и", "Icy": "И", "Idot": "İ", "iecy": "е", "IEcy": "Е", "iexcl": "¡", "iff": "⇔", "ifr": "𝔦", "Ifr": "ℑ", "igrave": "ì", "Igrave": "Ì", "ii": "ⅈ", "iiiint": "⨌", "iiint": "∭", "iinfin": "⧜", "iiota": "℩", "ijlig": "ĳ", "IJlig": "Ĳ", "Im": "ℑ", "imacr": "ī", "Imacr": "Ī", "image": "ℑ", "ImaginaryI": "ⅈ", "imagline": "ℐ", "imagpart": "ℑ", "imath": "ı", "imof": "⊷", "imped": "Ƶ", "Implies": "⇒", "in": "∈", "incare": "℅", "infin": "∞", "infintie": "⧝", "inodot": "ı", "int": "∫", "Int": "∬", "intcal": "⊺", "integers": "ℤ", "Integral": "∫", "intercal": "⊺", "Intersection": "⋂", "intlarhk": "⨗", "intprod": "⨼", "InvisibleComma": "⁣", "InvisibleTimes": "⁢", "iocy": "ё", "IOcy": "Ё", "iogon": "į", "Iogon": "Į", "iopf": "𝕚", "Iopf": "𝕀", "iota": "ι", "Iota": "Ι", "iprod": "⨼", "iquest": "¿", "iscr": "𝒾", "Iscr": "ℐ", "isin": "∈", "isindot": "⋵", "isinE": "⋹", "isins": "⋴", "isinsv": "⋳", "isinv": "∈", "it": "⁢", "itilde": "ĩ", "Itilde": "Ĩ", "iukcy": "і", "Iukcy": "І", "iuml": "ï", "Iuml": "Ï", "jcirc": "ĵ", "Jcirc": "Ĵ", "jcy": "й", "Jcy": "Й", "jfr": "𝔧", "Jfr": "𝔍", "jmath": "ȷ", "jopf": "𝕛", "Jopf": "𝕁", "jscr": "𝒿", "Jscr": "𝒥", "jsercy": "ј", "Jsercy": "Ј", "jukcy": "є", "Jukcy": "Є", "kappa": "κ", "Kappa": "Κ", "kappav": "ϰ", "kcedil": "ķ", "Kcedil": "Ķ", "kcy": "к", "Kcy": "К", "kfr": "𝔨", "Kfr": "𝔎", "kgreen": "ĸ", "khcy": "х", "KHcy": "Х", "kjcy": "ќ", "KJcy": "Ќ", "kopf": "𝕜", "Kopf": "𝕂", "kscr": "𝓀", "Kscr": "𝒦", "lAarr": "⇚", "lacute": "ĺ", "Lacute": "Ĺ", "laemptyv": "⦴", "lagran": "ℒ", "lambda": "λ", "Lambda": "Λ", "lang": "⟨", "Lang": "⟪", "langd": "⦑", "langle": "⟨", "lap": "⪅", "Laplacetrf": "ℒ", "laquo": "«", "larr": "←", "lArr": "⇐", "Larr": "↞", "larrb": "⇤", "larrbfs": "⤟", "larrfs": "⤝", "larrhk": "↩", "larrlp": "↫", "larrpl": "⤹", "larrsim": "⥳", "larrtl": "↢", "lat": "⪫", "latail": "⤙", "lAtail": "⤛", "late": "⪭", "lates": "⪭︀", "lbarr": "⤌", "lBarr": "⤎", "lbbrk": "❲", "lbrace": "{", "lbrack": "[", "lbrke": "⦋", "lbrksld": "⦏", "lbrkslu": "⦍", "lcaron": "ľ", "Lcaron": "Ľ", "lcedil": "ļ", "Lcedil": "Ļ", "lceil": "⌈", "lcub": "{", "lcy": "л", "Lcy": "Л", "ldca": "⤶", "ldquo": "“", "ldquor": "„", "ldrdhar": "⥧", "ldrushar": "⥋", "ldsh": "↲", "le": "≤", "lE": "≦", "LeftAngleBracket": "⟨", "leftarrow": "←", "Leftarrow": "⇐", "LeftArrow": "←", "LeftArrowBar": "⇤", "LeftArrowRightArrow": "⇆", "leftarrowtail": "↢", "LeftCeiling": "⌈", "LeftDoubleBracket": "⟦", "LeftDownTeeVector": "⥡", "LeftDownVector": "⇃", "LeftDownVectorBar": "⥙", "LeftFloor": "⌊", "leftharpoondown": "↽", "leftharpoonup": "↼", "leftleftarrows": "⇇", "leftrightarrow": "↔", "Leftrightarrow": "⇔", "LeftRightArrow": "↔", "leftrightarrows": "⇆", "leftrightharpoons": "⇋", "leftrightsquigarrow": "↭", "LeftRightVector": "⥎", "LeftTee": "⊣", "LeftTeeArrow": "↤", "LeftTeeVector": "⥚", "leftthreetimes": "⋋", "LeftTriangle": "⊲", "LeftTriangleBar": "⧏", "LeftTriangleEqual": "⊴", "LeftUpDownVector": "⥑", "LeftUpTeeVector": "⥠", "LeftUpVector": "↿", "LeftUpVectorBar": "⥘", "LeftVector": "↼", "LeftVectorBar": "⥒", "leg": "⋚", "lEg": "⪋", "leq": "≤", "leqq": "≦", "leqslant": "⩽", "les": "⩽", "lescc": "⪨", "lesdot": "⩿", "lesdoto": "⪁", "lesdotor": "⪃", "lesg": "⋚︀", "lesges": "⪓", "lessapprox": "⪅", "lessdot": "⋖", "lesseqgtr": "⋚", "lesseqqgtr": "⪋", "LessEqualGreater": "⋚", "LessFullEqual": "≦", "LessGreater": "≶", "lessgtr": "≶", "LessLess": "⪡", "lesssim": "≲", "LessSlantEqual": "⩽", "LessTilde": "≲", "lfisht": "⥼", "lfloor": "⌊", "lfr": "𝔩", "Lfr": "𝔏", "lg": "≶", "lgE": "⪑", "lHar": "⥢", "lhard": "↽", "lharu": "↼", "lharul": "⥪", "lhblk": "▄", "ljcy": "љ", "LJcy": "Љ", "ll": "≪", "Ll": "⋘", "llarr": "⇇", "llcorner": "⌞", "Lleftarrow": "⇚", "llhard": "⥫", "lltri": "◺", "lmidot": "ŀ", "Lmidot": "Ŀ", "lmoust": "⎰", "lmoustache": "⎰", "lnap": "⪉", "lnapprox": "⪉", "lne": "⪇", "lnE": "≨", "lneq": "⪇", "lneqq": "≨", "lnsim": "⋦", "loang": "⟬", "loarr": "⇽", "lobrk": "⟦", "longleftarrow": "⟵", "Longleftarrow": "⟸", "LongLeftArrow": "⟵", "longleftrightarrow": "⟷", "Longleftrightarrow": "⟺", "LongLeftRightArrow": "⟷", "longmapsto": "⟼", "longrightarrow": "⟶", "Longrightarrow": "⟹", "LongRightArrow": "⟶", "looparrowleft": "↫", "looparrowright": "↬", "lopar": "⦅", "lopf": "𝕝", "Lopf": "𝕃", "loplus": "⨭", "lotimes": "⨴", "lowast": "∗", "lowbar": "_", "LowerLeftArrow": "↙", "LowerRightArrow": "↘", "loz": "◊", "lozenge": "◊", "lozf": "⧫", "lpar": "(", "lparlt": "⦓", "lrarr": "⇆", "lrcorner": "⌟", "lrhar": "⇋", "lrhard": "⥭", "lrm": "‎", "lrtri": "⊿", "lsaquo": "‹", "lscr": "𝓁", "Lscr": "ℒ", "lsh": "↰", "Lsh": "↰", "lsim": "≲", "lsime": "⪍", "lsimg": "⪏", "lsqb": "[", "lsquo": "‘", "lsquor": "‚", "lstrok": "ł", "Lstrok": "Ł", "lt": "<", "Lt": "≪", "LT": "<", "ltcc": "⪦", "ltcir": "⩹", "ltdot": "⋖", "lthree": "⋋", "ltimes": "⋉", "ltlarr": "⥶", "ltquest": "⩻", "ltri": "◃", "ltrie": "⊴", "ltrif": "◂", "ltrPar": "⦖", "lurdshar": "⥊", "luruhar": "⥦", "lvertneqq": "≨︀", "lvnE": "≨︀", "macr": "¯", "male": "♂", "malt": "✠", "maltese": "✠", "map": "↦", "Map": "⤅", "mapsto": "↦", "mapstodown": "↧", "mapstoleft": "↤", "mapstoup": "↥", "marker": "▮", "mcomma": "⨩", "mcy": "м", "Mcy": "М", "mdash": "—", "mDDot": "∺", "measuredangle": "∡", "MediumSpace": " ", "Mellintrf": "ℳ", "mfr": "𝔪", "Mfr": "𝔐", "mho": "℧", "micro": "µ", "mid": "∣", "midast": "*", "midcir": "⫰", "middot": "·", "minus": "−", "minusb": "⊟", "minusd": "∸", "minusdu": "⨪", "MinusPlus": "∓", "mlcp": "⫛", "mldr": "…", "mnplus": "∓", "models": "⊧", "mopf": "𝕞", "Mopf": "𝕄", "mp": "∓", "mscr": "𝓂", "Mscr": "ℳ", "mstpos": "∾", "mu": "μ", "Mu": "Μ", "multimap": "⊸", "mumap": "⊸", "nabla": "∇", "nacute": "ń", "Nacute": "Ń", "nang": "∠⃒", "nap": "≉", "napE": "⩰̸", "napid": "≋̸", "napos": "ŉ", "napprox": "≉", "natur": "♮", "natural": "♮", "naturals": "ℕ", "nbsp": " ", "nbump": "≎̸", "nbumpe": "≏̸", "ncap": "⩃", "ncaron": "ň", "Ncaron": "Ň", "ncedil": "ņ", "Ncedil": "Ņ", "ncong": "≇", "ncongdot": "⩭̸", "ncup": "⩂", "ncy": "н", "Ncy": "Н", "ndash": "–", "ne": "≠", "nearhk": "⤤", "nearr": "↗", "neArr": "⇗", "nearrow": "↗", "nedot": "≐̸", "NegativeMediumSpace": "​", "NegativeThickSpace": "​", "NegativeThinSpace": "​", "NegativeVeryThinSpace": "​", "nequiv": "≢", "nesear": "⤨", "nesim": "≂̸", "NestedGreaterGreater": "≫", "NestedLessLess": "≪", "NewLine": "\n", "nexist": "∄", "nexists": "∄", "nfr": "𝔫", "Nfr": "𝔑", "nge": "≱", "ngE": "≧̸", "ngeq": "≱", "ngeqq": "≧̸", "ngeqslant": "⩾̸", "nges": "⩾̸", "nGg": "⋙̸", "ngsim": "≵", "ngt": "≯", "nGt": "≫⃒", "ngtr": "≯", "nGtv": "≫̸", "nharr": "↮", "nhArr": "⇎", "nhpar": "⫲", "ni": "∋", "nis": "⋼", "nisd": "⋺", "niv": "∋", "njcy": "њ", "NJcy": "Њ", "nlarr": "↚", "nlArr": "⇍", "nldr": "‥", "nle": "≰", "nlE": "≦̸", "nleftarrow": "↚", "nLeftarrow": "⇍", "nleftrightarrow": "↮", "nLeftrightarrow": "⇎", "nleq": "≰", "nleqq": "≦̸", "nleqslant": "⩽̸", "nles": "⩽̸", "nless": "≮", "nLl": "⋘̸", "nlsim": "≴", "nlt": "≮", "nLt": "≪⃒", "nltri": "⋪", "nltrie": "⋬", "nLtv": "≪̸", "nmid": "∤", "NoBreak": "⁠", "NonBreakingSpace": " ", "nopf": "𝕟", "Nopf": "ℕ", "not": "¬", "Not": "⫬", "NotCongruent": "≢", "NotCupCap": "≭", "NotDoubleVerticalBar": "∦", "NotElement": "∉", "NotEqual": "≠", "NotEqualTilde": "≂̸", "NotExists": "∄", "NotGreater": "≯", "NotGreaterEqual": "≱", "NotGreaterFullEqual": "≧̸", "NotGreaterGreater": "≫̸", "NotGreaterLess": "≹", "NotGreaterSlantEqual": "⩾̸", "NotGreaterTilde": "≵", "NotHumpDownHump": "≎̸", "NotHumpEqual": "≏̸", "notin": "∉", "notindot": "⋵̸", "notinE": "⋹̸", "notinva": "∉", "notinvb": "⋷", "notinvc": "⋶", "NotLeftTriangle": "⋪", "NotLeftTriangleBar": "⧏̸", "NotLeftTriangleEqual": "⋬", "NotLess": "≮", "NotLessEqual": "≰", "NotLessGreater": "≸", "NotLessLess": "≪̸", "NotLessSlantEqual": "⩽̸", "NotLessTilde": "≴", "NotNestedGreaterGreater": "⪢̸", "NotNestedLessLess": "⪡̸", "notni": "∌", "notniva": "∌", "notnivb": "⋾", "notnivc": "⋽", "NotPrecedes": "⊀", "NotPrecedesEqual": "⪯̸", "NotPrecedesSlantEqual": "⋠", "NotReverseElement": "∌", "NotRightTriangle": "⋫", "NotRightTriangleBar": "⧐̸", "NotRightTriangleEqual": "⋭", "NotSquareSubset": "⊏̸", "NotSquareSubsetEqual": "⋢", "NotSquareSuperset": "⊐̸", "NotSquareSupersetEqual": "⋣", "NotSubset": "⊂⃒", "NotSubsetEqual": "⊈", "NotSucceeds": "⊁", "NotSucceedsEqual": "⪰̸", "NotSucceedsSlantEqual": "⋡", "NotSucceedsTilde": "≿̸", "NotSuperset": "⊃⃒", "NotSupersetEqual": "⊉", "NotTilde": "≁", "NotTildeEqual": "≄", "NotTildeFullEqual": "≇", "NotTildeTilde": "≉", "NotVerticalBar": "∤", "npar": "∦", "nparallel": "∦", "nparsl": "⫽⃥", "npart": "∂̸", "npolint": "⨔", "npr": "⊀", "nprcue": "⋠", "npre": "⪯̸", "nprec": "⊀", "npreceq": "⪯̸", "nrarr": "↛", "nrArr": "⇏", "nrarrc": "⤳̸", "nrarrw": "↝̸", "nrightarrow": "↛", "nRightarrow": "⇏", "nrtri": "⋫", "nrtrie": "⋭", "nsc": "⊁", "nsccue": "⋡", "nsce": "⪰̸", "nscr": "𝓃", "Nscr": "𝒩", "nshortmid": "∤", "nshortparallel": "∦", "nsim": "≁", "nsime": "≄", "nsimeq": "≄", "nsmid": "∤", "nspar": "∦", "nsqsube": "⋢", "nsqsupe": "⋣", "nsub": "⊄", "nsube": "⊈", "nsubE": "⫅̸", "nsubset": "⊂⃒", "nsubseteq": "⊈", "nsubseteqq": "⫅̸", "nsucc": "⊁", "nsucceq": "⪰̸", "nsup": "⊅", "nsupe": "⊉", "nsupE": "⫆̸", "nsupset": "⊃⃒", "nsupseteq": "⊉", "nsupseteqq": "⫆̸", "ntgl": "≹", "ntilde": "ñ", "Ntilde": "Ñ", "ntlg": "≸", "ntriangleleft": "⋪", "ntrianglelefteq": "⋬", "ntriangleright": "⋫", "ntrianglerighteq": "⋭", "nu": "ν", "Nu": "Ν", "num": "#", "numero": "№", "numsp": " ", "nvap": "≍⃒", "nvdash": "⊬", "nvDash": "⊭", "nVdash": "⊮", "nVDash": "⊯", "nvge": "≥⃒", "nvgt": ">⃒", "nvHarr": "⤄", "nvinfin": "⧞", "nvlArr": "⤂", "nvle": "≤⃒", "nvlt": "<⃒", "nvltrie": "⊴⃒", "nvrArr": "⤃", "nvrtrie": "⊵⃒", "nvsim": "∼⃒", "nwarhk": "⤣", "nwarr": "↖", "nwArr": "⇖", "nwarrow": "↖", "nwnear": "⤧", "oacute": "ó", "Oacute": "Ó", "oast": "⊛", "ocir": "⊚", "ocirc": "ô", "Ocirc": "Ô", "ocy": "о", "Ocy": "О", "odash": "⊝", "odblac": "ő", "Odblac": "Ő", "odiv": "⨸", "odot": "⊙", "odsold": "⦼", "oelig": "œ", "OElig": "Œ", "ofcir": "⦿", "ofr": "𝔬", "Ofr": "𝔒", "ogon": "˛", "ograve": "ò", "Ograve": "Ò", "ogt": "⧁", "ohbar": "⦵", "ohm": "Ω", "oint": "∮", "olarr": "↺", "olcir": "⦾", "olcross": "⦻", "oline": "‾", "olt": "⧀", "omacr": "ō", "Omacr": "Ō", "omega": "ω", "Omega": "Ω", "omicron": "ο", "Omicron": "Ο", "omid": "⦶", "ominus": "⊖", "oopf": "𝕠", "Oopf": "𝕆", "opar": "⦷", "OpenCurlyDoubleQuote": "“", "OpenCurlyQuote": "‘", "operp": "⦹", "oplus": "⊕", "or": "∨", "Or": "⩔", "orarr": "↻", "ord": "⩝", "order": "ℴ", "orderof": "ℴ", "ordf": "ª", "ordm": "º", "origof": "⊶", "oror": "⩖", "orslope": "⩗", "orv": "⩛", "oS": "Ⓢ", "oscr": "ℴ", "Oscr": "𝒪", "oslash": "ø", "Oslash": "Ø", "osol": "⊘", "otilde": "õ", "Otilde": "Õ", "otimes": "⊗", "Otimes": "⨷", "otimesas": "⨶", "ouml": "ö", "Ouml": "Ö", "ovbar": "⌽", "OverBar": "‾", "OverBrace": "⏞", "OverBracket": "⎴", "OverParenthesis": "⏜", "par": "∥", "para": "¶", "parallel": "∥", "parsim": "⫳", "parsl": "⫽", "part": "∂", "PartialD": "∂", "pcy": "п", "Pcy": "П", "percnt": "%", "period": ".", "permil": "‰", "perp": "⊥", "pertenk": "‱", "pfr": "𝔭", "Pfr": "𝔓", "phi": "φ", "Phi": "Φ", "phiv": "ϕ", "phmmat": "ℳ", "phone": "☎", "pi": "π", "Pi": "Π", "pitchfork": "⋔", "piv": "ϖ", "planck": "ℏ", "planckh": "ℎ", "plankv": "ℏ", "plus": "+", "plusacir": "⨣", "plusb": "⊞", "pluscir": "⨢", "plusdo": "∔", "plusdu": "⨥", "pluse": "⩲", "PlusMinus": "±", "plusmn": "±", "plussim": "⨦", "plustwo": "⨧", "pm": "±", "Poincareplane": "ℌ", "pointint": "⨕", "popf": "𝕡", "Popf": "ℙ", "pound": "£", "pr": "≺", "Pr": "⪻", "prap": "⪷", "prcue": "≼", "pre": "⪯", "prE": "⪳", "prec": "≺", "precapprox": "⪷", "preccurlyeq": "≼", "Precedes": "≺", "PrecedesEqual": "⪯", "PrecedesSlantEqual": "≼", "PrecedesTilde": "≾", "preceq": "⪯", "precnapprox": "⪹", "precneqq": "⪵", "precnsim": "⋨", "precsim": "≾", "prime": "′", "Prime": "″", "primes": "ℙ", "prnap": "⪹", "prnE": "⪵", "prnsim": "⋨", "prod": "∏", "Product": "∏", "profalar": "⌮", "profline": "⌒", "profsurf": "⌓", "prop": "∝", "Proportion": "∷", "Proportional": "∝", "propto": "∝", "prsim": "≾", "prurel": "⊰", "pscr": "𝓅", "Pscr": "𝒫", "psi": "ψ", "Psi": "Ψ", "puncsp": " ", "qfr": "𝔮", "Qfr": "𝔔", "qint": "⨌", "qopf": "𝕢", "Qopf": "ℚ", "qprime": "⁗", "qscr": "𝓆", "Qscr": "𝒬", "quaternions": "ℍ", "quatint": "⨖", "quest": "?", "questeq": "≟", "quot": '"', "QUOT": '"', "rAarr": "⇛", "race": "∽̱", "racute": "ŕ", "Racute": "Ŕ", "radic": "√", "raemptyv": "⦳", "rang": "⟩", "Rang": "⟫", "rangd": "⦒", "range": "⦥", "rangle": "⟩", "raquo": "»", "rarr": "→", "rArr": "⇒", "Rarr": "↠", "rarrap": "⥵", "rarrb": "⇥", "rarrbfs": "⤠", "rarrc": "⤳", "rarrfs": "⤞", "rarrhk": "↪", "rarrlp": "↬", "rarrpl": "⥅", "rarrsim": "⥴", "rarrtl": "↣", "Rarrtl": "⤖", "rarrw": "↝", "ratail": "⤚", "rAtail": "⤜", "ratio": "∶", "rationals": "ℚ", "rbarr": "⤍", "rBarr": "⤏", "RBarr": "⤐", "rbbrk": "❳", "rbrace": "}", "rbrack": "]", "rbrke": "⦌", "rbrksld": "⦎", "rbrkslu": "⦐", "rcaron": "ř", "Rcaron": "Ř", "rcedil": "ŗ", "Rcedil": "Ŗ", "rceil": "⌉", "rcub": "}", "rcy": "р", "Rcy": "Р", "rdca": "⤷", "rdldhar": "⥩", "rdquo": "”", "rdquor": "”", "rdsh": "↳", "Re": "ℜ", "real": "ℜ", "realine": "ℛ", "realpart": "ℜ", "reals": "ℝ", "rect": "▭", "reg": "®", "REG": "®", "ReverseElement": "∋", "ReverseEquilibrium": "⇋", "ReverseUpEquilibrium": "⥯", "rfisht": "⥽", "rfloor": "⌋", "rfr": "𝔯", "Rfr": "ℜ", "rHar": "⥤", "rhard": "⇁", "rharu": "⇀", "rharul": "⥬", "rho": "ρ", "Rho": "Ρ", "rhov": "ϱ", "RightAngleBracket": "⟩", "rightarrow": "→", "Rightarrow": "⇒", "RightArrow": "→", "RightArrowBar": "⇥", "RightArrowLeftArrow": "⇄", "rightarrowtail": "↣", "RightCeiling": "⌉", "RightDoubleBracket": "⟧", "RightDownTeeVector": "⥝", "RightDownVector": "⇂", "RightDownVectorBar": "⥕", "RightFloor": "⌋", "rightharpoondown": "⇁", "rightharpoonup": "⇀", "rightleftarrows": "⇄", "rightleftharpoons": "⇌", "rightrightarrows": "⇉", "rightsquigarrow": "↝", "RightTee": "⊢", "RightTeeArrow": "↦", "RightTeeVector": "⥛", "rightthreetimes": "⋌", "RightTriangle": "⊳", "RightTriangleBar": "⧐", "RightTriangleEqual": "⊵", "RightUpDownVector": "⥏", "RightUpTeeVector": "⥜", "RightUpVector": "↾", "RightUpVectorBar": "⥔", "RightVector": "⇀", "RightVectorBar": "⥓", "ring": "˚", "risingdotseq": "≓", "rlarr": "⇄", "rlhar": "⇌", "rlm": "‏", "rmoust": "⎱", "rmoustache": "⎱", "rnmid": "⫮", "roang": "⟭", "roarr": "⇾", "robrk": "⟧", "ropar": "⦆", "ropf": "𝕣", "Ropf": "ℝ", "roplus": "⨮", "rotimes": "⨵", "RoundImplies": "⥰", "rpar": ")", "rpargt": "⦔", "rppolint": "⨒", "rrarr": "⇉", "Rrightarrow": "⇛", "rsaquo": "›", "rscr": "𝓇", "Rscr": "ℛ", "rsh": "↱", "Rsh": "↱", "rsqb": "]", "rsquo": "’", "rsquor": "’", "rthree": "⋌", "rtimes": "⋊", "rtri": "▹", "rtrie": "⊵", "rtrif": "▸", "rtriltri": "⧎", "RuleDelayed": "⧴", "ruluhar": "⥨", "rx": "℞", "sacute": "ś", "Sacute": "Ś", "sbquo": "‚", "sc": "≻", "Sc": "⪼", "scap": "⪸", "scaron": "š", "Scaron": "Š", "sccue": "≽", "sce": "⪰", "scE": "⪴", "scedil": "ş", "Scedil": "Ş", "scirc": "ŝ", "Scirc": "Ŝ", "scnap": "⪺", "scnE": "⪶", "scnsim": "⋩", "scpolint": "⨓", "scsim": "≿", "scy": "с", "Scy": "С", "sdot": "⋅", "sdotb": "⊡", "sdote": "⩦", "searhk": "⤥", "searr": "↘", "seArr": "⇘", "searrow": "↘", "sect": "§", "semi": ";", "seswar": "⤩", "setminus": "∖", "setmn": "∖", "sext": "✶", "sfr": "𝔰", "Sfr": "𝔖", "sfrown": "⌢", "sharp": "♯", "shchcy": "щ", "SHCHcy": "Щ", "shcy": "ш", "SHcy": "Ш", "ShortDownArrow": "↓", "ShortLeftArrow": "←", "shortmid": "∣", "shortparallel": "∥", "ShortRightArrow": "→", "ShortUpArrow": "↑", "shy": "­", "sigma": "σ", "Sigma": "Σ", "sigmaf": "ς", "sigmav": "ς", "sim": "∼", "simdot": "⩪", "sime": "≃", "simeq": "≃", "simg": "⪞", "simgE": "⪠", "siml": "⪝", "simlE": "⪟", "simne": "≆", "simplus": "⨤", "simrarr": "⥲", "slarr": "←", "SmallCircle": "∘", "smallsetminus": "∖", "smashp": "⨳", "smeparsl": "⧤", "smid": "∣", "smile": "⌣", "smt": "⪪", "smte": "⪬", "smtes": "⪬︀", "softcy": "ь", "SOFTcy": "Ь", "sol": "/", "solb": "⧄", "solbar": "⌿", "sopf": "𝕤", "Sopf": "𝕊", "spades": "♠", "spadesuit": "♠", "spar": "∥", "sqcap": "⊓", "sqcaps": "⊓︀", "sqcup": "⊔", "sqcups": "⊔︀", "Sqrt": "√", "sqsub": "⊏", "sqsube": "⊑", "sqsubset": "⊏", "sqsubseteq": "⊑", "sqsup": "⊐", "sqsupe": "⊒", "sqsupset": "⊐", "sqsupseteq": "⊒", "squ": "□", "square": "□", "Square": "□", "SquareIntersection": "⊓", "SquareSubset": "⊏", "SquareSubsetEqual": "⊑", "SquareSuperset": "⊐", "SquareSupersetEqual": "⊒", "SquareUnion": "⊔", "squarf": "▪", "squf": "▪", "srarr": "→", "sscr": "𝓈", "Sscr": "𝒮", "ssetmn": "∖", "ssmile": "⌣", "sstarf": "⋆", "star": "☆", "Star": "⋆", "starf": "★", "straightepsilon": "ϵ", "straightphi": "ϕ", "strns": "¯", "sub": "⊂", "Sub": "⋐", "subdot": "⪽", "sube": "⊆", "subE": "⫅", "subedot": "⫃", "submult": "⫁", "subne": "⊊", "subnE": "⫋", "subplus": "⪿", "subrarr": "⥹", "subset": "⊂", "Subset": "⋐", "subseteq": "⊆", "subseteqq": "⫅", "SubsetEqual": "⊆", "subsetneq": "⊊", "subsetneqq": "⫋", "subsim": "⫇", "subsub": "⫕", "subsup": "⫓", "succ": "≻", "succapprox": "⪸", "succcurlyeq": "≽", "Succeeds": "≻", "SucceedsEqual": "⪰", "SucceedsSlantEqual": "≽", "SucceedsTilde": "≿", "succeq": "⪰", "succnapprox": "⪺", "succneqq": "⪶", "succnsim": "⋩", "succsim": "≿", "SuchThat": "∋", "sum": "∑", "Sum": "∑", "sung": "♪", "sup": "⊃", "Sup": "⋑", "sup1": "¹", "sup2": "²", "sup3": "³", "supdot": "⪾", "supdsub": "⫘", "supe": "⊇", "supE": "⫆", "supedot": "⫄", "Superset": "⊃", "SupersetEqual": "⊇", "suphsol": "⟉", "suphsub": "⫗", "suplarr": "⥻", "supmult": "⫂", "supne": "⊋", "supnE": "⫌", "supplus": "⫀", "supset": "⊃", "Supset": "⋑", "supseteq": "⊇", "supseteqq": "⫆", "supsetneq": "⊋", "supsetneqq": "⫌", "supsim": "⫈", "supsub": "⫔", "supsup": "⫖", "swarhk": "⤦", "swarr": "↙", "swArr": "⇙", "swarrow": "↙", "swnwar": "⤪", "szlig": "ß", "Tab": "	", "target": "⌖", "tau": "τ", "Tau": "Τ", "tbrk": "⎴", "tcaron": "ť", "Tcaron": "Ť", "tcedil": "ţ", "Tcedil": "Ţ", "tcy": "т", "Tcy": "Т", "tdot": "⃛", "telrec": "⌕", "tfr": "𝔱", "Tfr": "𝔗", "there4": "∴", "therefore": "∴", "Therefore": "∴", "theta": "θ", "Theta": "Θ", "thetasym": "ϑ", "thetav": "ϑ", "thickapprox": "≈", "thicksim": "∼", "ThickSpace": "  ", "thinsp": " ", "ThinSpace": " ", "thkap": "≈", "thksim": "∼", "thorn": "þ", "THORN": "Þ", "tilde": "˜", "Tilde": "∼", "TildeEqual": "≃", "TildeFullEqual": "≅", "TildeTilde": "≈", "times": "×", "timesb": "⊠", "timesbar": "⨱", "timesd": "⨰", "tint": "∭", "toea": "⤨", "top": "⊤", "topbot": "⌶", "topcir": "⫱", "topf": "𝕥", "Topf": "𝕋", "topfork": "⫚", "tosa": "⤩", "tprime": "‴", "trade": "™", "TRADE": "™", "triangle": "▵", "triangledown": "▿", "triangleleft": "◃", "trianglelefteq": "⊴", "triangleq": "≜", "triangleright": "▹", "trianglerighteq": "⊵", "tridot": "◬", "trie": "≜", "triminus": "⨺", "TripleDot": "⃛", "triplus": "⨹", "trisb": "⧍", "tritime": "⨻", "trpezium": "⏢", "tscr": "𝓉", "Tscr": "𝒯", "tscy": "ц", "TScy": "Ц", "tshcy": "ћ", "TSHcy": "Ћ", "tstrok": "ŧ", "Tstrok": "Ŧ", "twixt": "≬", "twoheadleftarrow": "↞", "twoheadrightarrow": "↠", "uacute": "ú", "Uacute": "Ú", "uarr": "↑", "uArr": "⇑", "Uarr": "↟", "Uarrocir": "⥉", "ubrcy": "ў", "Ubrcy": "Ў", "ubreve": "ŭ", "Ubreve": "Ŭ", "ucirc": "û", "Ucirc": "Û", "ucy": "у", "Ucy": "У", "udarr": "⇅", "udblac": "ű", "Udblac": "Ű", "udhar": "⥮", "ufisht": "⥾", "ufr": "𝔲", "Ufr": "𝔘", "ugrave": "ù", "Ugrave": "Ù", "uHar": "⥣", "uharl": "↿", "uharr": "↾", "uhblk": "▀", "ulcorn": "⌜", "ulcorner": "⌜", "ulcrop": "⌏", "ultri": "◸", "umacr": "ū", "Umacr": "Ū", "uml": "¨", "UnderBar": "_", "UnderBrace": "⏟", "UnderBracket": "⎵", "UnderParenthesis": "⏝", "Union": "⋃", "UnionPlus": "⊎", "uogon": "ų", "Uogon": "Ų", "uopf": "𝕦", "Uopf": "𝕌", "uparrow": "↑", "Uparrow": "⇑", "UpArrow": "↑", "UpArrowBar": "⤒", "UpArrowDownArrow": "⇅", "updownarrow": "↕", "Updownarrow": "⇕", "UpDownArrow": "↕", "UpEquilibrium": "⥮", "upharpoonleft": "↿", "upharpoonright": "↾", "uplus": "⊎", "UpperLeftArrow": "↖", "UpperRightArrow": "↗", "upsi": "υ", "Upsi": "ϒ", "upsih": "ϒ", "upsilon": "υ", "Upsilon": "Υ", "UpTee": "⊥", "UpTeeArrow": "↥", "upuparrows": "⇈", "urcorn": "⌝", "urcorner": "⌝", "urcrop": "⌎", "uring": "ů", "Uring": "Ů", "urtri": "◹", "uscr": "𝓊", "Uscr": "𝒰", "utdot": "⋰", "utilde": "ũ", "Utilde": "Ũ", "utri": "▵", "utrif": "▴", "uuarr": "⇈", "uuml": "ü", "Uuml": "Ü", "uwangle": "⦧", "vangrt": "⦜", "varepsilon": "ϵ", "varkappa": "ϰ", "varnothing": "∅", "varphi": "ϕ", "varpi": "ϖ", "varpropto": "∝", "varr": "↕", "vArr": "⇕", "varrho": "ϱ", "varsigma": "ς", "varsubsetneq": "⊊︀", "varsubsetneqq": "⫋︀", "varsupsetneq": "⊋︀", "varsupsetneqq": "⫌︀", "vartheta": "ϑ", "vartriangleleft": "⊲", "vartriangleright": "⊳", "vBar": "⫨", "Vbar": "⫫", "vBarv": "⫩", "vcy": "в", "Vcy": "В", "vdash": "⊢", "vDash": "⊨", "Vdash": "⊩", "VDash": "⊫", "Vdashl": "⫦", "vee": "∨", "Vee": "⋁", "veebar": "⊻", "veeeq": "≚", "vellip": "⋮", "verbar": "|", "Verbar": "‖", "vert": "|", "Vert": "‖", "VerticalBar": "∣", "VerticalLine": "|", "VerticalSeparator": "❘", "VerticalTilde": "≀", "VeryThinSpace": " ", "vfr": "𝔳", "Vfr": "𝔙", "vltri": "⊲", "vnsub": "⊂⃒", "vnsup": "⊃⃒", "vopf": "𝕧", "Vopf": "𝕍", "vprop": "∝", "vrtri": "⊳", "vscr": "𝓋", "Vscr": "𝒱", "vsubne": "⊊︀", "vsubnE": "⫋︀", "vsupne": "⊋︀", "vsupnE": "⫌︀", "Vvdash": "⊪", "vzigzag": "⦚", "wcirc": "ŵ", "Wcirc": "Ŵ", "wedbar": "⩟", "wedge": "∧", "Wedge": "⋀", "wedgeq": "≙", "weierp": "℘", "wfr": "𝔴", "Wfr": "𝔚", "wopf": "𝕨", "Wopf": "𝕎", "wp": "℘", "wr": "≀", "wreath": "≀", "wscr": "𝓌", "Wscr": "𝒲", "xcap": "⋂", "xcirc": "◯", "xcup": "⋃", "xdtri": "▽", "xfr": "𝔵", "Xfr": "𝔛", "xharr": "⟷", "xhArr": "⟺", "xi": "ξ", "Xi": "Ξ", "xlarr": "⟵", "xlArr": "⟸", "xmap": "⟼", "xnis": "⋻", "xodot": "⨀", "xopf": "𝕩", "Xopf": "𝕏", "xoplus": "⨁", "xotime": "⨂", "xrarr": "⟶", "xrArr": "⟹", "xscr": "𝓍", "Xscr": "𝒳", "xsqcup": "⨆", "xuplus": "⨄", "xutri": "△", "xvee": "⋁", "xwedge": "⋀", "yacute": "ý", "Yacute": "Ý", "yacy": "я", "YAcy": "Я", "ycirc": "ŷ", "Ycirc": "Ŷ", "ycy": "ы", "Ycy": "Ы", "yen": "¥", "yfr": "𝔶", "Yfr": "𝔜", "yicy": "ї", "YIcy": "Ї", "yopf": "𝕪", "Yopf": "𝕐", "yscr": "𝓎", "Yscr": "𝒴", "yucy": "ю", "YUcy": "Ю", "yuml": "ÿ", "Yuml": "Ÿ", "zacute": "ź", "Zacute": "Ź", "zcaron": "ž", "Zcaron": "Ž", "zcy": "з", "Zcy": "З", "zdot": "ż", "Zdot": "Ż", "zeetrf": "ℨ", "ZeroWidthSpace": "​", "zeta": "ζ", "Zeta": "Ζ", "zfr": "𝔷", "Zfr": "ℨ", "zhcy": "ж", "ZHcy": "Ж", "zigrarr": "⇝", "zopf": "𝕫", "Zopf": "ℤ", "zscr": "𝓏", "Zscr": "𝒵", "zwj": "‍", "zwnj": "‌" };
    var decodeMapLegacy = { "aacute": "á", "Aacute": "Á", "acirc": "â", "Acirc": "Â", "acute": "´", "aelig": "æ", "AElig": "Æ", "agrave": "à", "Agrave": "À", "amp": "&", "AMP": "&", "aring": "å", "Aring": "Å", "atilde": "ã", "Atilde": "Ã", "auml": "ä", "Auml": "Ä", "brvbar": "¦", "ccedil": "ç", "Ccedil": "Ç", "cedil": "¸", "cent": "¢", "copy": "©", "COPY": "©", "curren": "¤", "deg": "°", "divide": "÷", "eacute": "é", "Eacute": "É", "ecirc": "ê", "Ecirc": "Ê", "egrave": "è", "Egrave": "È", "eth": "ð", "ETH": "Ð", "euml": "ë", "Euml": "Ë", "frac12": "½", "frac14": "¼", "frac34": "¾", "gt": ">", "GT": ">", "iacute": "í", "Iacute": "Í", "icirc": "î", "Icirc": "Î", "iexcl": "¡", "igrave": "ì", "Igrave": "Ì", "iquest": "¿", "iuml": "ï", "Iuml": "Ï", "laquo": "«", "lt": "<", "LT": "<", "macr": "¯", "micro": "µ", "middot": "·", "nbsp": " ", "not": "¬", "ntilde": "ñ", "Ntilde": "Ñ", "oacute": "ó", "Oacute": "Ó", "ocirc": "ô", "Ocirc": "Ô", "ograve": "ò", "Ograve": "Ò", "ordf": "ª", "ordm": "º", "oslash": "ø", "Oslash": "Ø", "otilde": "õ", "Otilde": "Õ", "ouml": "ö", "Ouml": "Ö", "para": "¶", "plusmn": "±", "pound": "£", "quot": '"', "QUOT": '"', "raquo": "»", "reg": "®", "REG": "®", "sect": "§", "shy": "­", "sup1": "¹", "sup2": "²", "sup3": "³", "szlig": "ß", "thorn": "þ", "THORN": "Þ", "times": "×", "uacute": "ú", "Uacute": "Ú", "ucirc": "û", "Ucirc": "Û", "ugrave": "ù", "Ugrave": "Ù", "uml": "¨", "uuml": "ü", "Uuml": "Ü", "yacute": "ý", "Yacute": "Ý", "yen": "¥", "yuml": "ÿ" };
    var decodeMapNumeric = { "0": "�", "128": "€", "130": "‚", "131": "ƒ", "132": "„", "133": "…", "134": "†", "135": "‡", "136": "ˆ", "137": "‰", "138": "Š", "139": "‹", "140": "Œ", "142": "Ž", "145": "‘", "146": "’", "147": "“", "148": "”", "149": "•", "150": "–", "151": "—", "152": "˜", "153": "™", "154": "š", "155": "›", "156": "œ", "158": "ž", "159": "Ÿ" };
    var invalidReferenceCodePoints = [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 64976, 64977, 64978, 64979, 64980, 64981, 64982, 64983, 64984, 64985, 64986, 64987, 64988, 64989, 64990, 64991, 64992, 64993, 64994, 64995, 64996, 64997, 64998, 64999, 65e3, 65001, 65002, 65003, 65004, 65005, 65006, 65007, 65534, 65535, 131070, 131071, 196606, 196607, 262142, 262143, 327678, 327679, 393214, 393215, 458750, 458751, 524286, 524287, 589822, 589823, 655358, 655359, 720894, 720895, 786430, 786431, 851966, 851967, 917502, 917503, 983038, 983039, 1048574, 1048575, 1114110, 1114111];
    var stringFromCharCode = String.fromCharCode;
    var object = {};
    var hasOwnProperty2 = object.hasOwnProperty;
    var has = function(object2, propertyName) {
      return hasOwnProperty2.call(object2, propertyName);
    };
    var contains = function(array, value) {
      var index = -1;
      var length = array.length;
      while (++index < length) {
        if (array[index] == value) {
          return true;
        }
      }
      return false;
    };
    var merge = function(options, defaults) {
      if (!options) {
        return defaults;
      }
      var result = {};
      var key2;
      for (key2 in defaults) {
        result[key2] = has(options, key2) ? options[key2] : defaults[key2];
      }
      return result;
    };
    var codePointToSymbol = function(codePoint, strict) {
      var output = "";
      if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
        if (strict) {
          parseError("character reference outside the permissible Unicode range");
        }
        return "�";
      }
      if (has(decodeMapNumeric, codePoint)) {
        if (strict) {
          parseError("disallowed character reference");
        }
        return decodeMapNumeric[codePoint];
      }
      if (strict && contains(invalidReferenceCodePoints, codePoint)) {
        parseError("disallowed character reference");
      }
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += stringFromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += stringFromCharCode(codePoint);
      return output;
    };
    var hexEscape = function(codePoint) {
      return "&#x" + codePoint.toString(16).toUpperCase() + ";";
    };
    var decEscape = function(codePoint) {
      return "&#" + codePoint + ";";
    };
    var parseError = function(message) {
      throw Error("Parse error: " + message);
    };
    var encode = function(string, options) {
      options = merge(options, encode.options);
      var strict = options.strict;
      if (strict && regexInvalidRawCodePoint.test(string)) {
        parseError("forbidden code point");
      }
      var encodeEverything = options.encodeEverything;
      var useNamedReferences = options.useNamedReferences;
      var allowUnsafeSymbols = options.allowUnsafeSymbols;
      var escapeCodePoint = options.decimal ? decEscape : hexEscape;
      var escapeBmpSymbol = function(symbol) {
        return escapeCodePoint(symbol.charCodeAt(0));
      };
      if (encodeEverything) {
        string = string.replace(regexAsciiWhitelist, function(symbol) {
          if (useNamedReferences && has(encodeMap, symbol)) {
            return "&" + encodeMap[symbol] + ";";
          }
          return escapeBmpSymbol(symbol);
        });
        if (useNamedReferences) {
          string = string.replace(/&gt;\u20D2/g, "&nvgt;").replace(/&lt;\u20D2/g, "&nvlt;").replace(/&#x66;&#x6A;/g, "&fjlig;");
        }
        if (useNamedReferences) {
          string = string.replace(regexEncodeNonAscii, function(string2) {
            return "&" + encodeMap[string2] + ";";
          });
        }
      } else if (useNamedReferences) {
        if (!allowUnsafeSymbols) {
          string = string.replace(regexEscape, function(string2) {
            return "&" + encodeMap[string2] + ";";
          });
        }
        string = string.replace(/&gt;\u20D2/g, "&nvgt;").replace(/&lt;\u20D2/g, "&nvlt;");
        string = string.replace(regexEncodeNonAscii, function(string2) {
          return "&" + encodeMap[string2] + ";";
        });
      } else if (!allowUnsafeSymbols) {
        string = string.replace(regexEscape, escapeBmpSymbol);
      }
      return string.replace(regexAstralSymbols, function($0) {
        var high = $0.charCodeAt(0);
        var low = $0.charCodeAt(1);
        var codePoint = (high - 55296) * 1024 + low - 56320 + 65536;
        return escapeCodePoint(codePoint);
      }).replace(regexBmpWhitelist, escapeBmpSymbol);
    };
    encode.options = {
      "allowUnsafeSymbols": false,
      "encodeEverything": false,
      "strict": false,
      "useNamedReferences": false,
      "decimal": false
    };
    var decode2 = function(html, options) {
      options = merge(options, decode2.options);
      var strict = options.strict;
      if (strict && regexInvalidEntity.test(html)) {
        parseError("malformed character reference");
      }
      return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
        var codePoint;
        var semicolon;
        var decDigits;
        var hexDigits;
        var reference;
        var next;
        if ($1) {
          reference = $1;
          return decodeMap[reference];
        }
        if ($2) {
          reference = $2;
          next = $3;
          if (next && options.isAttributeValue) {
            if (strict && next == "=") {
              parseError("`&` did not start a character reference");
            }
            return $0;
          } else {
            if (strict) {
              parseError(
                "named character reference was not terminated by a semicolon"
              );
            }
            return decodeMapLegacy[reference] + (next || "");
          }
        }
        if ($4) {
          decDigits = $4;
          semicolon = $5;
          if (strict && !semicolon) {
            parseError("character reference was not terminated by a semicolon");
          }
          codePoint = parseInt(decDigits, 10);
          return codePointToSymbol(codePoint, strict);
        }
        if ($6) {
          hexDigits = $6;
          semicolon = $7;
          if (strict && !semicolon) {
            parseError("character reference was not terminated by a semicolon");
          }
          codePoint = parseInt(hexDigits, 16);
          return codePointToSymbol(codePoint, strict);
        }
        if (strict) {
          parseError(
            "named character reference was not terminated by a semicolon"
          );
        }
        return $0;
      });
    };
    decode2.options = {
      "isAttributeValue": false,
      "strict": false
    };
    var escape = function(string) {
      return string.replace(regexEscape, function($0) {
        return escapeMap[$0];
      });
    };
    var he2 = {
      "version": "1.2.0",
      "encode": encode,
      "decode": decode2,
      "escape": escape,
      "unescape": decode2
    };
    if (freeExports && !freeExports.nodeType) {
      if (freeModule) {
        freeModule.exports = he2;
      } else {
        for (var key in he2) {
          has(he2, key) && (freeExports[key] = he2[key]);
        }
      }
    } else {
      root.he = he2;
    }
  })(commonjsGlobal);
})(he, he.exports);
var heExports = he.exports;
var Struct = {};
Object.defineProperty(Struct, "__esModule", { value: true });
Struct.isStruct = isStruct;
const DateTime_1 = requireDateTime();
function isStruct(o) {
  var _a2;
  return o != null && ((_a2 = o.constructor) == null ? void 0 : _a2.name) === "Object" && Object.values(o).every((v) => {
    const t = typeof v;
    return t === "string" || t === "number" || (0, DateTime_1.isDateOrTime)(v) || isStruct(v) || Array.isArray(v);
  });
}
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.WriteTask = exports2.DefaultWriteTaskOptions = exports2.WriteTaskOptionFields = void 0;
  exports2.htmlEncode = htmlEncode;
  const he_1 = heExports;
  const _path2 = __importStar2(require$$1$1);
  const DateTime_12 = requireDateTime();
  const DefaultExifToolOptions_1 = DefaultExifToolOptions;
  const ErrorsAndWarnings_12 = ErrorsAndWarnings;
  const ExifToolTask_12 = ExifToolTask$1;
  const FilenameCharsetArgs_12 = FilenameCharsetArgs;
  const Number_12 = _Number;
  const Object_12 = _Object;
  const Pick_12 = Pick;
  const String_12 = _String;
  const Struct_1 = Struct;
  const sep = String.fromCharCode(31);
  function htmlEncode(s2) {
    return (
      // allowUnsafeSymbols is true because ExifTool doesn't care about &, <, >, ", ', * and `
      (0, he_1.encode)(s2, { decimal: true, allowUnsafeSymbols: true }).replace(/\s/g, (m) => m === " " ? " " : `&#${m.charCodeAt(0)};`)
    );
  }
  function enc(o, structValue = false) {
    if (o == null) {
      return "";
    } else if ((0, Number_12.isNumber)(o)) {
      return String(o);
    } else if ((0, String_12.isString)(o)) {
      return htmlEncode(structValue ? o.replace(/[,[\]{}|]/g, (ea) => "|" + ea) : o);
    } else if ((0, DateTime_12.isDateOrTime)(o)) {
      return (0, DateTime_12.toExifString)(o);
    } else if (Array.isArray(o)) {
      const primitiveArray = o.every((ea) => (0, String_12.isString)(ea) || (0, Number_12.isNumber)(ea));
      return primitiveArray ? `${o.map((ea) => enc(ea)).join(sep)}` : `[${o.map((ea) => enc(ea)).join(",")}]`;
    } else if ((0, Struct_1.isStruct)(o)) {
      return `{${(0, Object_12.keys)(o).map((k) => enc(k, true) + "=" + enc(o[k], true)).join(",")}}`;
    } else {
      throw new Error("cannot encode " + JSON.stringify(o));
    }
  }
  exports2.WriteTaskOptionFields = [
    "useMWG",
    "struct",
    "ignoreMinorErrors",
    "writeArgs"
  ];
  exports2.DefaultWriteTaskOptions = {
    ...(0, Pick_12.pick)(DefaultExifToolOptions_1.DefaultExifToolOptions, ...exports2.WriteTaskOptionFields)
  };
  class WriteTask2 extends ExifToolTask_12.ExifToolTask {
    constructor(sourceFile, args, options) {
      super(args, options);
      __publicField(this, "sourceFile");
      __publicField(this, "args");
      __publicField(this, "options");
      this.sourceFile = sourceFile;
      this.args = args;
      this.options = options;
    }
    static for(filename, tags, options) {
      const sourceFile = _path2.resolve(filename);
      const args = [
        ...FilenameCharsetArgs_12.Utf8FilenameCharsetArgs,
        `-sep`,
        `${sep}`,
        "-E"
        // < html encoding https://exiftool.org/faq.html#Q10
      ];
      args.push("-api", "struct=" + ((0, Number_12.isNumber)(options == null ? void 0 : options.struct) ? options.struct : "2"));
      if ((options == null ? void 0 : options.useMWG) ?? exports2.DefaultWriteTaskOptions.useMWG) {
        args.push("-use", "MWG");
      }
      if ((0, Number_12.isNumber)(tags.GPSLatitude)) {
        tags.GPSLatitudeRef ?? (tags.GPSLatitudeRef = tags.GPSLatitude);
      } else if (tags.GPSLatitude === null) {
        tags.GPSLatitudeRef ?? (tags.GPSLatitudeRef = null);
      }
      if ((0, Number_12.isNumber)(tags.GPSLongitude)) {
        tags.GPSLongitudeRef ?? (tags.GPSLongitudeRef = tags.GPSLongitude);
      } else if (tags.GPSLongitude === null) {
        tags.GPSLongitudeRef ?? (tags.GPSLongitudeRef = null);
      }
      if ((0, Number_12.isNumber)(tags.GPSLatitude) && (0, Number_12.isNumber)(tags.GPSLongitude)) {
        tags.GPSPosition = tags.GPSLatitude + "," + tags.GPSLongitude;
      }
      if ((0, Number_12.isNumber)(tags.GPSAltitude)) {
        tags.GPSAltitudeRef ?? (tags.GPSAltitudeRef = tags.GPSAltitude);
      }
      for (const key of (0, Object_12.keys)(tags)) {
        const val = tags[key];
        args.push(`-${key}=${enc(val)}`);
      }
      if (options.writeArgs != null)
        args.push(...options.writeArgs);
      args.push(sourceFile);
      return new WriteTask2(sourceFile, args, options);
    }
    toString() {
      return "WriteTask(" + this.sourceFile + ")";
    }
    // we're handling the stderr output ourselves, so we tell ExifToolTask that
    // all stderr output is not ignorable so we can capture the warnings
    parse(data, error) {
      var _a2, _b, _c, _d, _e, _f;
      if (error != null)
        throw error;
      let created = 0;
      let updated = 0;
      let unchanged = 0;
      for (const line of (0, String_12.splitLines)(data)) {
        const m_created = (_b = (_a2 = CreatedRE.exec(line)) == null ? void 0 : _a2.groups) == null ? void 0 : _b.count;
        if (m_created != null) {
          created += (0, Number_12.toInt)(m_created) ?? 0;
          continue;
        }
        const m_unchanged = (_d = (_c = UnchangedRE.exec(line)) == null ? void 0 : _c.groups) == null ? void 0 : _d.count;
        if (m_unchanged != null) {
          unchanged += (0, Number_12.toInt)(m_unchanged) ?? 0;
          continue;
        }
        const m_updated = (_f = (_e = UpdatedRE.exec(line)) == null ? void 0 : _e.groups) == null ? void 0 : _f.count;
        if (m_updated != null) {
          updated += (0, Number_12.toInt)(m_updated) ?? 0;
          continue;
        }
        this.warnings.push("Unexpected output from ExifTool: " + JSON.stringify(line));
      }
      const w = (0, ErrorsAndWarnings_12.errorsAndWarnings)(this).warnings ?? [];
      return {
        created,
        updated,
        unchanged,
        ...w.length === 0 ? {} : { warnings: w }
      };
    }
  }
  exports2.WriteTask = WriteTask2;
  const CreatedRE = /(?<count>\d{1,5}) [\w ]{1,12}\bcreated$/i;
  const UnchangedRE = /(?<count>\d{1,5}) [\w ]{1,12}\b(?:weren't updated|unchanged)$/i;
  const UpdatedRE = /(?<count>\d{1,5}) [\w ]{1,12}\bupdated$/i;
})(WriteTask);
var GeolocationTags = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.GeolocationTagNames = void 0;
  exports2.isGeolocationTag = isGeolocationTag;
  exports2.GeolocationTagNames = [
    "GeolocationBearing",
    "GeolocationCity",
    "GeolocationCountry",
    "GeolocationCountryCode",
    "GeolocationDistance",
    "GeolocationFeatureCode",
    "GeolocationFeatureType",
    "GeolocationPopulation",
    "GeolocationPosition",
    "GeolocationRegion",
    "GeolocationSubregion",
    "GeolocationTimeZone"
  ];
  function isGeolocationTag(name) {
    return exports2.GeolocationTagNames.includes(name);
  }
})(GeolocationTags);
var _JSON = {};
Object.defineProperty(_JSON, "__esModule", { value: true });
_JSON.parseJSON = parseJSON;
const BinaryField_1 = BinaryField$1;
const ExifDate_1 = requireExifDate();
const ExifDateTime_1 = requireExifDateTime();
const ExifTime_1 = requireExifTime();
const Revivers = {
  BinaryField: (ea) => BinaryField_1.BinaryField.fromJSON(ea),
  ExifDateTime: (ea) => ExifDateTime_1.ExifDateTime.fromJSON(ea),
  ExifDate: (ea) => ExifDate_1.ExifDate.fromJSON(ea),
  ExifTime: (ea) => ExifTime_1.ExifTime.fromJSON(ea)
};
function parseJSON(s2) {
  return JSON.parse(s2, (_key, value) => {
    var _a2;
    return ((_a2 = Revivers[value == null ? void 0 : value._ctor]) == null ? void 0 : _a2.call(Revivers, value)) ?? value;
  });
}
(function(exports2) {
  var _taskOptions, _checkForPerl;
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.exiftool = exports2.ExifTool = exports2.DefaultWriteTaskOptions = exports2.offsetMinutesToZoneName = exports2.defaultVideosToUTC = exports2.UnsetZoneOffsetMinutes = exports2.UnsetZoneName = exports2.UnsetZone = exports2.TimezoneOffsetTagnames = exports2.DefaultReadTaskOptions = exports2.parseJSON = exports2.isGeolocationTag = exports2.exiftoolPath = exports2.ExifToolTask = exports2.ExifTime = exports2.ExifDateTime = exports2.ExifDate = exports2.DefaultMaxProcs = exports2.DefaultExiftoolArgs = exports2.DefaultExifToolOptions = exports2.CapturedAtTagNames = exports2.BinaryField = void 0;
  const bc2 = __importStar2(BatchCluster);
  const _cp = __importStar2(require$$0$3);
  const _fs2 = __importStar2(require$$0$5);
  const node_process_12 = __importDefault2(require$$1);
  const Array_12 = _Array;
  const AsyncRetry_1 = AsyncRetry;
  const BinaryExtractionTask_1 = BinaryExtractionTask$1;
  const BinaryToBufferTask_1 = BinaryToBufferTask$1;
  const DefaultExifToolOptions_1 = DefaultExifToolOptions;
  const DeleteAllTagsArgs_1 = DeleteAllTagsArgs;
  const ExifToolOptions_1 = ExifToolOptions;
  const ExiftoolPath_1 = ExiftoolPath;
  const IsWin32_12 = IsWin32;
  const Lazy_12 = Lazy;
  const Object_12 = _Object;
  const Pick_12 = Pick;
  const ReadRawTask_1 = ReadRawTask$1;
  const ReadTask_1 = ReadTask;
  const RewriteAllTagsTask_1 = RewriteAllTagsTask$1;
  const String_12 = _String;
  const VersionTask_1 = VersionTask$1;
  const Which_12 = Which;
  const WriteTask_1 = WriteTask;
  var BinaryField_12 = BinaryField$1;
  Object.defineProperty(exports2, "BinaryField", { enumerable: true, get: function() {
    return BinaryField_12.BinaryField;
  } });
  var CapturedAtTagNames_1 = CapturedAtTagNames;
  Object.defineProperty(exports2, "CapturedAtTagNames", { enumerable: true, get: function() {
    return CapturedAtTagNames_1.CapturedAtTagNames;
  } });
  var DefaultExifToolOptions_2 = DefaultExifToolOptions;
  Object.defineProperty(exports2, "DefaultExifToolOptions", { enumerable: true, get: function() {
    return DefaultExifToolOptions_2.DefaultExifToolOptions;
  } });
  var DefaultExiftoolArgs_1 = DefaultExiftoolArgs;
  Object.defineProperty(exports2, "DefaultExiftoolArgs", { enumerable: true, get: function() {
    return DefaultExiftoolArgs_1.DefaultExiftoolArgs;
  } });
  var DefaultMaxProcs_1 = DefaultMaxProcs;
  Object.defineProperty(exports2, "DefaultMaxProcs", { enumerable: true, get: function() {
    return DefaultMaxProcs_1.DefaultMaxProcs;
  } });
  var ExifDate_12 = requireExifDate();
  Object.defineProperty(exports2, "ExifDate", { enumerable: true, get: function() {
    return ExifDate_12.ExifDate;
  } });
  var ExifDateTime_12 = requireExifDateTime();
  Object.defineProperty(exports2, "ExifDateTime", { enumerable: true, get: function() {
    return ExifDateTime_12.ExifDateTime;
  } });
  var ExifTime_12 = requireExifTime();
  Object.defineProperty(exports2, "ExifTime", { enumerable: true, get: function() {
    return ExifTime_12.ExifTime;
  } });
  var ExifToolTask_12 = ExifToolTask$1;
  Object.defineProperty(exports2, "ExifToolTask", { enumerable: true, get: function() {
    return ExifToolTask_12.ExifToolTask;
  } });
  var ExiftoolPath_2 = ExiftoolPath;
  Object.defineProperty(exports2, "exiftoolPath", { enumerable: true, get: function() {
    return ExiftoolPath_2.exiftoolPath;
  } });
  var GeolocationTags_1 = GeolocationTags;
  Object.defineProperty(exports2, "isGeolocationTag", { enumerable: true, get: function() {
    return GeolocationTags_1.isGeolocationTag;
  } });
  var JSON_1 = _JSON;
  Object.defineProperty(exports2, "parseJSON", { enumerable: true, get: function() {
    return JSON_1.parseJSON;
  } });
  var ReadTask_2 = ReadTask;
  Object.defineProperty(exports2, "DefaultReadTaskOptions", { enumerable: true, get: function() {
    return ReadTask_2.DefaultReadTaskOptions;
  } });
  var Timezones_1 = requireTimezones();
  Object.defineProperty(exports2, "TimezoneOffsetTagnames", { enumerable: true, get: function() {
    return Timezones_1.TimezoneOffsetTagnames;
  } });
  Object.defineProperty(exports2, "UnsetZone", { enumerable: true, get: function() {
    return Timezones_1.UnsetZone;
  } });
  Object.defineProperty(exports2, "UnsetZoneName", { enumerable: true, get: function() {
    return Timezones_1.UnsetZoneName;
  } });
  Object.defineProperty(exports2, "UnsetZoneOffsetMinutes", { enumerable: true, get: function() {
    return Timezones_1.UnsetZoneOffsetMinutes;
  } });
  Object.defineProperty(exports2, "defaultVideosToUTC", { enumerable: true, get: function() {
    return Timezones_1.defaultVideosToUTC;
  } });
  Object.defineProperty(exports2, "offsetMinutesToZoneName", { enumerable: true, get: function() {
    return Timezones_1.offsetMinutesToZoneName;
  } });
  var WriteTask_2 = WriteTask;
  Object.defineProperty(exports2, "DefaultWriteTaskOptions", { enumerable: true, get: function() {
    return WriteTask_2.DefaultWriteTaskOptions;
  } });
  const PERL = "/usr/bin/perl";
  const _ignoreShebang = (0, Lazy_12.lazy)(() => !(0, IsWin32_12.isWin32)() && !_fs2.existsSync(PERL));
  const whichPerl = (0, Lazy_12.lazy)(async () => {
    const result = await (0, Which_12.which)(PERL);
    if (result == null) {
      throw new Error("Perl must be installed. Please add perl to your $PATH and try again.");
    }
    return result;
  });
  class ExifTool2 {
    constructor(options = {}) {
      __publicField(this, "options");
      __publicField(this, "batchCluster");
      __publicField(this, "exiftoolPath", (0, Lazy_12.lazy)(async () => {
        const o = this.options;
        return await ((0, Object_12.isFunction)(o.exiftoolPath) ? o.exiftoolPath(this.options.logger()) : o.exiftoolPath) ?? (0, ExiftoolPath_1.exiftoolPath)(this.options.logger());
      }));
      __privateAdd(this, _taskOptions, (0, Lazy_12.lazy)(() => (0, Pick_12.pick)(this.options, "ignoreMinorErrors")));
      /**
       * Register life cycle event listeners. Delegates to BatchProcess.
       */
      __publicField(this, "on", (event, listener) => this.batchCluster.on(event, listener));
      /**
       * Unregister life cycle event listeners. Delegates to BatchProcess.
       */
      __publicField(this, "off", (event, listener) => this.batchCluster.off(event, listener));
      // calling whichPerl through this lazy() means we only do that task once per
      // instance.
      __privateAdd(this, _checkForPerl, (0, Lazy_12.lazy)(async () => {
        if (this.options.checkPerl) {
          await whichPerl();
        }
      }));
      if (options != null && typeof options !== "object") {
        throw new Error("Please update caller to the new ExifTool constructor API");
      }
      const o = (0, ExifToolOptions_1.handleDeprecatedOptions)({
        ...DefaultExifToolOptions_1.DefaultExifToolOptions,
        ...options
      });
      const ignoreShebang = o.ignoreShebang ?? _ignoreShebang();
      const env = { ...o.exiftoolEnv, LANG: "C" };
      if ((0, String_12.notBlank)(node_process_12.default.env.EXIFTOOL_HOME) && (0, String_12.blank)(env.EXIFTOOL_HOME)) {
        env.EXIFTOOL_HOME = node_process_12.default.env.EXIFTOOL_HOME;
      }
      const spawnOpts = {
        stdio: "pipe",
        shell: false,
        detached: false,
        // < no orphaned exiftool procs, please
        env
      };
      const processFactory = async () => ignoreShebang ? _cp.spawn(await whichPerl(), [await this.exiftoolPath(), ...o.exiftoolArgs], spawnOpts) : _cp.spawn(await this.exiftoolPath(), o.exiftoolArgs, spawnOpts);
      this.options = {
        ...o,
        ignoreShebang,
        processFactory
      };
      this.batchCluster = new bc2.BatchCluster(this.options);
    }
    /**
     * @return a promise holding the version number of the vendored ExifTool
     */
    version() {
      return this.enqueueTask(() => new VersionTask_1.VersionTask(this.options));
    }
    read(file, argsOrOptions, options) {
      const opts = {
        ...(0, Pick_12.pick)(this.options, ...ReadTask_1.ReadTaskOptionFields),
        ...(0, Object_12.isObject)(argsOrOptions) ? argsOrOptions : options
      };
      opts.readArgs = (0, Array_12.ifArr)(argsOrOptions) ?? (0, Array_12.ifArr)(opts.readArgs) ?? this.options.readArgs;
      return this.enqueueTask(() => ReadTask_1.ReadTask.for(file, opts));
    }
    /**
     * Read the tags from `file`, without any post-processing of ExifTool values.
     *
     * **You probably want `read`, not this method. READ THE REST OF THIS COMMENT
     * CAREFULLY.**
     *
     * If you want to extract specific tag values from a file, you may want to use
     * this, but all data validation and inference heuristics provided by `read`
     * will be skipped.
     *
     * Note that performance will be very similar to `read`, and will actually be
     * worse if you don't include `-fast` or `-fast2` (as the most expensive bit
     * is the perl interpreter and scanning the file on disk).
     *
     * @param args any additional arguments other than the file path. Note that
     * "-json", and the Windows unicode filename handler flags, "-charset
     * filename=utf8", will be added automatically.
     *
     * @return Note that the return value will be similar to `Tags`, but with no
     * date, time, or other rich type parsing that you get from `.read()`. The
     * field values will be `string | number | string[]`.
     *
     * @see https://github.com/photostructure/exiftool-vendored.js/issues/44 for
     * typing details.
     */
    readRaw(file, args = []) {
      return this.enqueueTask(() => ReadRawTask_1.ReadRawTask.for(file, args, __privateGet(this, _taskOptions).call(this)));
    }
    /**
     * Write the given `tags` to `file`.
     *
     * **NOTE: no input validation is done by this library.** ExifTool, however,
     * is strict about tag names and values in the context of the format of file
     * being written to.
     *
     * @param file an existing file to write `tags` to
     *
     * @param tags the tags to write to `file`.
     *
     * @param options overrides to the default ExifTool options provided to the
     * ExifTool constructor.
     *
     * @returns Either the promise will be resolved if the tags are written to
     * successfully, or the promise will be rejected if there are errors or
     * warnings.
     *
     * @see https://exiftool.org/exiftool_pod.html#overwrite_original
     */
    write(file, tags, writeArgsOrOptions, options) {
      const opts = {
        ...(0, Pick_12.pick)(this.options, ...WriteTask_1.WriteTaskOptionFields),
        ...(0, Object_12.isObject)(writeArgsOrOptions) ? writeArgsOrOptions : options
      };
      opts.writeArgs = (0, Array_12.ifArr)(writeArgsOrOptions) ?? (0, Array_12.ifArr)(opts.writeArgs) ?? this.options.writeArgs;
      const retriable = false;
      return this.enqueueTask(() => WriteTask_1.WriteTask.for(file, tags, opts), retriable);
    }
    /**
     * This will strip `file` of all metadata tags. The original file (with the
     * name `${FILENAME}_original`) will be retained. Note that some tags, like
     * stat information and image dimensions, are intrinsic to the file and will
     * continue to exist if you re-`read` the file.
     *
     * @param {string} file the file to strip of metadata
     *
     * @param {(keyof Tags | string)[]} opts.retain optional. If provided, this is
     * a list of metadata keys to **not** delete.
     */
    deleteAllTags(file, opts) {
      const args = [...DeleteAllTagsArgs_1.DeleteAllTagsArgs];
      for (const ea of (opts == null ? void 0 : opts.retain) ?? []) {
        args.push(`-${ea}<${ea}`);
      }
      return this.write(file, {}, args, (0, Object_12.omit)(opts ?? {}, "retain"));
    }
    /**
     * Extract the low-resolution thumbnail in `path/to/image.jpg`
     * and write it to `path/to/thumbnail.jpg`.
     *
     * Note that these images can be less than .1 megapixels in size.
     *
     * @return a `Promise<void>`. An `Error` is raised if
     * the file could not be read or the output not written.
     */
    extractThumbnail(imageFile, thumbnailFile, opts) {
      return this.extractBinaryTag("ThumbnailImage", imageFile, thumbnailFile, opts);
    }
    /**
     * Extract the "preview" image in `path/to/image.jpg`
     * and write it to `path/to/preview.jpg`.
     *
     * The size of these images varies widely, and is present in dSLR images.
     * Canon, Fuji, Olympus, and Sony use this tag.
     *
     * @return a `Promise<void>`. An `Error` is raised if
     * the file could not be read or the output not written.
     */
    extractPreview(imageFile, previewFile, opts) {
      return this.extractBinaryTag("PreviewImage", imageFile, previewFile, opts);
    }
    /**
     * Extract the "JpgFromRaw" image in `path/to/image.jpg` and write it to
     * `path/to/fromRaw.jpg`.
     *
     * This size of these images varies widely, and is not present in all RAW
     * images. Nikon and Panasonic use this tag.
     *
     * @return a `Promise<void>`. The promise will be rejected if the file could
     * not be read or the output not written.
     */
    extractJpgFromRaw(imageFile, outputFile, opts) {
      return this.extractBinaryTag("JpgFromRaw", imageFile, outputFile, opts);
    }
    /**
     * Extract a given binary value from "tagname" tag associated to
     * `path/to/image.jpg` and write it to `dest` (which cannot exist and whose
     * directory must already exist).
     *
     * @return a `Promise<void>`. The promise will be rejected if the binary
     * output not be written to `dest`.
     */
    async extractBinaryTag(tagname, src, dest, opts) {
      const maybeError = await this.enqueueTask(() => BinaryExtractionTask_1.BinaryExtractionTask.for(tagname, src, dest, {
        ...__privateGet(this, _taskOptions).call(this),
        ...opts
      }));
      if (maybeError != null) {
        throw new Error(maybeError);
      }
    }
    /**
     * Extract a given binary value from "tagname" tag associated to
     * `path/to/image.jpg` as a `Buffer`. This has the advantage of not writing to
     * a file, but if the payload associated to `tagname` is large, this can cause
     * out-of-memory errors.
     *
     * @return a `Promise<Buffer>`. The promise will be rejected if the file or
     * tag is missing.
     */
    async extractBinaryTagToBuffer(tagname, imageFile, opts) {
      const result = await this.enqueueTask(() => BinaryToBufferTask_1.BinaryToBufferTask.for(tagname, imageFile, {
        ...__privateGet(this, _taskOptions).call(this),
        ...opts
      }));
      if (Buffer.isBuffer(result)) {
        return result;
      } else if (result instanceof Error) {
        throw result;
      } else {
        throw new Error("Unexpected result from BinaryToBufferTask: " + JSON.stringify(result));
      }
    }
    /**
     * Attempt to fix metadata problems in JPEG images by deleting all metadata
     * and rebuilding from scratch. After repairing an image you should be able to
     * write to it without errors, but some metadata from the original image may
     * be lost in the process.
     *
     * This should only be applied as a last resort to images whose metadata is
     * not readable via {@link ExifTool.read()}.
     *
     * @see https://exiftool.org/faq.html#Q20
     *
     * @param {string} inputFile the path to the problematic image
     * @param {string} outputFile the path to write the repaired image
     * @param {boolean} opts.allowMakerNoteRepair if there are problems with MakerNote
     * tags, allow ExifTool to apply heuristics to recover corrupt tags. See
     * exiftool's `-F` flag.
     * @return {Promise<void>} resolved when outputFile has been written.
     */
    rewriteAllTags(inputFile, outputFile, opts) {
      return this.enqueueTask(() => RewriteAllTagsTask_1.RewriteAllTagsTask.for(inputFile, outputFile, {
        allowMakerNoteRepair: false,
        ...__privateGet(this, _taskOptions).call(this),
        ...opts
      }));
    }
    /**
     * Shut down running ExifTool child processes. No subsequent requests will be
     * accepted.
     *
     * This may need to be called in `after` or `finally` clauses in tests or
     * scripts for them to exit cleanly.
     */
    end(gracefully = true) {
      return this.batchCluster.end(gracefully).promise;
    }
    /**
     * @return true if `.end()` has been invoked
     */
    get ended() {
      return this.batchCluster.ended;
    }
    /**
     * Most users will not need to use `enqueueTask` directly. This method
     * supports submitting custom `BatchCluster` tasks.
     *
     * @param task is a thunk to support retries by providing new instances on retries.
     *
     * @see BinaryExtractionTask for an example task implementation
     */
    enqueueTask(task, retriable = true) {
      const f = async () => {
        await __privateGet(this, _checkForPerl).call(this);
        return this.batchCluster.enqueueTask(task());
      };
      return retriable ? (0, AsyncRetry_1.retryOnReject)(f, this.options.taskRetries) : f();
    }
    /**
     * @return the currently running ExifTool processes. Note that on Windows,
     * these are only the process IDs of the directly-spawned ExifTool wrapper,
     * and not the actual perl vm. This should only really be relevant for
     * integration tests that verify processes are cleaned up properly.
     */
    get pids() {
      return this.batchCluster.pids();
    }
    /**
     * @return the number of pending (not currently worked on) tasks
     */
    get pendingTasks() {
      return this.batchCluster.pendingTaskCount;
    }
    /**
     * @return the total number of child processes created by this instance
     */
    get spawnedProcs() {
      return this.batchCluster.spawnedProcCount;
    }
    /**
     * @return the current number of child processes currently servicing tasks
     */
    get busyProcs() {
      return this.batchCluster.busyProcCount;
    }
    /**
     * @return report why child processes were recycled
     */
    childEndCounts() {
      return this.batchCluster.childEndCounts;
    }
    /**
     * Shut down any currently-running child processes. New child processes will
     * be started automatically to handle new tasks.
     */
    closeChildProcesses(gracefully = true) {
      return this.batchCluster.closeChildProcesses(gracefully);
    }
  }
  _taskOptions = new WeakMap();
  _checkForPerl = new WeakMap();
  exports2.ExifTool = ExifTool2;
  exports2.exiftool = new ExifTool2();
})(ExifTool);
class MetadataService extends BaseService {
  constructor() {
    super();
    __publicField(this, "exiftool");
    this.exiftool = new ExifTool.ExifTool();
  }
  getHandlers() {
    return [
      {
        channel: MetadataIPC.METADATA_WRITE,
        handler: this.writeMetadata.bind(this)
      }
    ];
  }
  /**
   * 批量寫入元數據到圖片
   * @param imageDir 圖片目錄路徑
   * @param csvData CSV數據行數組
   * @returns 處理結果數組
   */
  async writeMetadata(imageDir, csvData) {
    const results = [];
    for (const row of csvData) {
      try {
        const imagePath = path__namespace.join(imageDir, row.Filename);
        console.log("處理圖片：", imagePath);
        try {
          await fs.promises.access(imagePath);
        } catch {
          console.error("圖片文件不存在：", imagePath);
          results.push({
            filename: row.Filename,
            success: false,
            error: "圖片文件不存在"
          });
          continue;
        }
        const metadata = {
          Title: row.Title,
          Description: row.Description,
          Keywords: row.Keywords.split(",").map((k) => k.trim()),
          //   Subject: row.Keywords.split(',').map(k => k.trim()), // 某些查看器使用 Subject
          "XMP:Title": row.Title,
          "XMP:Description": row.Description,
          //   'XMP:Subject': row.Keywords.split(',').map(k => k.trim()),
          "IPTC:ObjectName": row.Title,
          "IPTC:Caption-Abstract": row.Description
          //   'IPTC:Keywords': row.Keywords.split(',').map(k => k.trim()),
        };
        await this.exiftool.write(imagePath, metadata);
        const writtenMetadata = await this.exiftool.read(imagePath);
        console.log("寫入後的元數據：", {
          filename: row.Filename,
          metadata: {
            Title: writtenMetadata.Title,
            Description: writtenMetadata.Description,
            Keywords: writtenMetadata.Keywords
          }
        });
        results.push({
          filename: row.Filename,
          success: true,
          metadata: {
            Title: writtenMetadata.Title,
            Description: writtenMetadata.Description,
            Keywords: writtenMetadata.Keywords
          }
        });
      } catch (error) {
        console.error("處理圖片時發生錯誤：", row.Filename, error);
        results.push({
          filename: row.Filename,
          success: false,
          error: error instanceof Error ? error.message : "寫入元數據時發生錯誤"
        });
      }
    }
    console.log("處理完成，結果：", results);
    return results;
  }
  // 當服務被銷毀時關閉 ExifTool
  async destroy() {
    await this.exiftool.end();
  }
}
if (process.env.NODE_ENV === "development") {
  const electronReloader = require("electron-reloader");
  try {
    console.log("Development mode detected, enabling hot reload...");
    electronReloader(module, {
      debug: true,
      watchRenderer: false,
      // 由 Vite 处理渲染进程的热重载
      ignore: ["node_modules/**/*", "release/**/*", "dist/**/*", ".vite/**/*", ".git/**/*"],
      // 指定要监听的文件
      paths: [
        path__namespace.join(__dirname, "**", "*.ts"),
        path__namespace.join(__dirname, "**", "*.js"),
        path__namespace.join(__dirname, "..", "src", "**", "*.ts"),
        path__namespace.join(__dirname, "..", "src", "**", "*.js")
      ]
    });
    console.log("Hot reload enabled successfully");
  } catch (err) {
    console.error("Failed to setup hot reload:", err);
  }
}
electron.ipcMain.handle("send-message", async (event, message) => {
  console.log("Received message from renderer:", message);
  return `Server received: ${message}`;
});
electron.ipcMain.handle("get-system-info", async () => {
  console.log("Getting systeminfo...");
  return {
    platform: process.platform,
    version: electron.app.getVersion(),
    electronVersion: process.versions.electron
  };
});
const initializeServices = () => {
  console.log("Initializing services...");
  const services = [
    new FileService(),
    new MetadataService()
    // 添加更多服務...
  ];
  services.forEach((service) => {
    console.log("Registering handlers for service:", service.constructor.name);
    service.registerHandlers();
  });
  console.log("Services initialized successfully");
};
const createWindow = async () => {
  console.log("/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/metadata-desktop/metadata-app/.vite/build/preload.js", "MAIN_WINDOW_VITE_PRELOAD");
  const mainWindow = new electron.BrowserWindow({
    height: 1e3,
    width: 1200,
    webPreferences: {
      preload: "/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/metadata-desktop/metadata-app/.vite/build/preload.js",
      nodeIntegration: true,
      contextIsolation: true
    }
  });
  if (process.env.NODE_ENV === "development") {
    await mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile("/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/metadata-desktop/metadata-app/.vite/renderer/index.html");
  }
};
electron.app.on("ready", () => {
  console.log("App is ready, initializing...");
  createWindow();
  initializeServices();
  console.log("App initialization completed");
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
if (require("electron-squirrel-startup")) {
  electron.app.quit();
}
//# sourceMappingURL=index.js.map
