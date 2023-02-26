import { get_webusb } from './snippets/hw_common-c933ea30ea0fef0d/inline0.js';
import { device_interface } from './snippets/hw_common-c933ea30ea0fef0d/inline1.js';
import { websocket_transport } from './snippets/libp2p-wasm-ext-0a95fd7509554c17/src/websockets.js';
import { get_provider_js } from './snippets/web3-3a881fca17d19cd8/inline0.js';

let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_40(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h12e0a5d7789fe99b(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_43(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h853d31379a56cc26(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_46(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h994842274cb31d0b(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_49(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hff5efe61cb22186d(arg0, arg1);
}

function __wbg_adapter_52(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h017e508befd098b0(arg0, arg1);
}

function __wbg_adapter_55(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha5b0f169ff855c61(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_58(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf9f3e36d744ade31(arg0, arg1);
}

/**
* Runs a MarketMaker2 instance.
*
* # Parameters
*
* * `conf` is a UTF-8 string JSON.
* * `log_cb` is a JS function with the following signature:
* ```typescript
* function(level: number, line: string)
* ```
*
* # Usage
*
* ```javascript
* import init, {mm2_main, LogLevel, Mm2MainErr} from "./path/to/mm2.js";
*
* const params = {
*     conf: { "gui":"WASMTEST", mm2:1, "passphrase":"YOUR_PASSPHRASE_HERE", "rpc_password":"test123", "coins":[{"coin":"ETH","protocol":{"type":"ETH"}}] },
*     log_level: LogLevel.Info,
* };
* let handle_log = function (_level, line) { console.log(line) };
* try {
*     mm2_main(params, handle_log);
* } catch (e) {
*     switch (e) {
*         case Mm2MainErr.AlreadyRuns:
*             alert("MarketMaker2 already runs...");
*             break;
*         // handle other errors...
*         default:
*             alert(`Unexpected error: ${e}`);
*             break;
*     }
* }
* ```
* @param {any} params
* @param {Function} log_cb
*/
export function mm2_main(params, log_cb) {
    wasm.mm2_main(addHeapObject(params), addHeapObject(log_cb));
}

/**
* Returns the MarketMaker2 instance status.
* @returns {number}
*/
export function mm2_main_status() {
    var ret = wasm.mm2_main_status();
    return ret >>> 0;
}

/**
* Invokes an RPC request.
*
* # Parameters
*
* * `payload` is a UTF-8 string JSON.
*
* # Usage
*
* ```javascript
* import init, {mm2_rpc, Mm2RpcErr} from "./path/to/mm2.js";
*
* async function version () {
*     try {
*         const payload = {
*             "userpass": "test123",
*             "method": "version",
*         };
*         const response = await mm2_rpc(payload);
*         return response.result;
*     } catch (e) {
*         switch (e) {
*             case Mm2RpcErr.NotRunning:
*                 alert("MarketMaker2 not running yet...");
*                 break;
*             // handle other errors...
*             default:
*                 alert(`Unexpected error: ${e}`);
*                 break;
*         }
*     }
* }
* ```
* @param {any} payload
* @returns {Promise<any>}
*/
export function mm2_rpc(payload) {
    var ret = wasm.mm2_rpc(addHeapObject(payload));
    return takeObject(ret);
}

/**
* Get the MarketMaker2 version.
*
* # Usage
*
* The function can be used before mm2 runs.
*
* ```javascript
* import init, {mm2_version} from "./path/to/mm2.js";
*
* function print_version () {
*     const response = mm2_version();
*     console.log(`version: ${response.result}, datetime: ${response.datetime}`);
* }
* ```
* @returns {any}
*/
export function mm2_version() {
    var ret = wasm.mm2_version();
    return takeObject(ret);
}

/**
* Stops the MarketMaker2 instance.
*
* # Usage
*
* ```javascript
* import init, {mm2_stop} from "./path/to/mm2.js";
*
* async function stop () {
*     try {
*         await mm2_stop();
*     } catch (e) {
*         switch (e) {
*             case Mm2RpcErr.NotRunning:
*                 alert("MarketMaker2 not running yet...");
*                 break;
*             // handle other errors...
*             default:
*                 alert(`Unexpected error: ${e}`);
*                 break;
*         }
*     }
* }
* ```
* @returns {Promise<void>}
*/
export function mm2_stop() {
    var ret = wasm.mm2_stop();
    return takeObject(ret);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
export function __wbgtest_console_log(args) {
    try {
        wasm.__wbgtest_console_log(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_debug(args) {
    try {
        wasm.__wbgtest_console_debug(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_info(args) {
    try {
        wasm.__wbgtest_console_info(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_warn(args) {
    try {
        wasm.__wbgtest_console_warn(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_error(args) {
    try {
        wasm.__wbgtest_console_error(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function __wbg_adapter_102(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures__invoke0_mut__hbe72884fe5d3e810(arg0, arg1);
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
function __wbg_adapter_349(arg0, arg1, arg2, arg3, arg4) {
    wasm.wasm_bindgen__convert__closures__invoke3_mut__h3f54d5bf672909fa(arg0, arg1, addHeapObject(arg2), arg3, addHeapObject(arg4));
}

function __wbg_adapter_416(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__ha214f9d795878e49(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);

const int64CvtShim = new BigInt64Array(u32CvtShim.buffer);
/**
* The errors can be thrown when using the `mm2_main` function incorrectly.
*/
export const Mm2MainErr = Object.freeze({ AlreadyRuns:1,"1":"AlreadyRuns",InvalidParams:2,"2":"InvalidParams",NoCoinsInConf:3,"3":"NoCoinsInConf", });
/**
* The errors can be thrown when using the `mm2_rpc` function incorrectly.
*/
export const Mm2RpcErr = Object.freeze({ NotRunning:1,"1":"NotRunning",InvalidPayload:2,"2":"InvalidPayload",InternalError:3,"3":"InternalError", });
/**
*/
export const MainStatus = Object.freeze({
/**
* MM2 is not running yet.
*/
NotRunning:0,"0":"NotRunning",
/**
* MM2 is running, but no context yet.
*/
NoContext:1,"1":"NoContext",
/**
* MM2 is running, but no RPC yet.
*/
NoRpc:2,"2":"NoRpc",
/**
* MM2's RPC is up.
*/
RpcIsUp:3,"3":"RpcIsUp", });
/**
*/
export const LogLevel = Object.freeze({
/**
* A level lower than all log levels.
*/
Off:0,"0":"Off",
/**
* Corresponds to the `ERROR` log level.
*/
Error:1,"1":"Error",
/**
* Corresponds to the `WARN` log level.
*/
Warn:2,"2":"Warn",
/**
* Corresponds to the `INFO` log level.
*/
Info:3,"3":"Info",
/**
* Corresponds to the `DEBUG` log level.
*/
Debug:4,"4":"Debug",
/**
* Corresponds to the `TRACE` log level.
*/
Trace:5,"5":"Trace", });
/**
*/
export class RequestArguments {

    static __wrap(ptr) {
        const obj = Object.create(RequestArguments.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_requestarguments_free(ptr);
    }
    /**
    * @returns {string}
    */
    get method() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.requestarguments_method(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get params() {
        var ret = wasm.requestarguments_params(this.ptr);
        return takeObject(ret);
    }
}
/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
export class WasmBindgenTestContext {

    static __wrap(ptr) {
        const obj = Object.create(WasmBindgenTestContext.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbindgentestcontext_free(ptr);
    }
    /**
    * Creates a new context ready to run tests.
    *
    * A `Context` is the main structure through which test execution is
    * coordinated, and this will collect output and results for all executed
    * tests.
    */
    constructor() {
        var ret = wasm.wasmbindgentestcontext_new();
        return WasmBindgenTestContext.__wrap(ret);
    }
    /**
    * Inform this context about runtime arguments passed to the test
    * harness.
    *
    * Eventually this will be used to support flags, but for now it's just
    * used to support test filters.
    * @param {any[]} args
    */
    args(args) {
        var ptr0 = passArrayJsValueToWasm0(args, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmbindgentestcontext_args(this.ptr, ptr0, len0);
    }
    /**
    * Executes a list of tests, returning a promise representing their
    * eventual completion.
    *
    * This is the main entry point for executing tests. All the tests passed
    * in are the JS `Function` object that was plucked off the
    * `WebAssembly.Instance` exports list.
    *
    * The promise returned resolves to either `true` if all tests passed or
    * `false` if at least one test failed.
    * @param {any[]} tests
    * @returns {Promise<any>}
    */
    run(tests) {
        var ptr0 = passArrayJsValueToWasm0(tests, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.wasmbindgentestcontext_run(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('mm2lib_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        var ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_dial_1f8e56b305fcf44d = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).dial(getStringFromWasm0(arg1, arg2), arg3 !== 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_listenon_1885247979b88a8b = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).listen_on(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_read_9eaaf1fd1e03eb9b = function(arg0) {
        var ret = getObject(arg0).read;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newaddrs_ff4981cbf3ee4ad9 = function(arg0, arg1) {
        var ret = getObject(arg1).new_addrs;
        var ptr0 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_newconnections_9525a8138f43e4fd = function(arg0, arg1) {
        var ret = getObject(arg1).new_connections;
        var ptr0 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_localaddr_2f6f404984d02a3c = function(arg0, arg1) {
        var ret = getObject(arg1).local_addr;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_observedaddr_28299220e170cc00 = function(arg0, arg1) {
        var ret = getObject(arg1).observed_addr;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_connection_7fead32f5c4871eb = function(arg0) {
        var ret = getObject(arg0).connection;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_expiredaddrs_244331d0d5f5e28c = function(arg0, arg1) {
        var ret = getObject(arg1).expired_addrs;
        var ptr0 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        var ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbg_write_2f7a1194eabf9ee5 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).write(getArrayU8FromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_shutdown_bad4cd66f1b432a3 = function() { return handleError(function (arg0) {
        getObject(arg0).shutdown();
    }, arguments) };
    imports.wbg.__wbg_close_11019f9c9666b272 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_websockettransport_35fc39b2551cb920 = function() {
        var ret = websocket_transport();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        var ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbg_log_f3074702e994caf3 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_String_2a7fcd265cdab274 = function(arg0, arg1) {
        var ret = String(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getElementById_da9217f6fcc32281 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_settextcontent_e458442dd43c9a76 = function(arg0, arg1, arg2) {
        getObject(arg0).textContent = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_wbgtestinvoke_ae3f70f766304b45 = function() { return handleError(function (arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = () => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_102(a, state0.b, );
                } finally {
                    state0.a = a;
                }
            };
            __wbg_test_invoke(cb0);
        } finally {
            state0.a = state0.b = 0;
        }
    }, arguments) };
    imports.wbg.__wbg_static_accessor_document_dc3b965d687c01ae = function() {
        var ret = document;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_textcontent_3a99a8dd44d08ed7 = function(arg0, arg1) {
        var ret = getObject(arg1).textContent;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_stack_2eeb345b4368df3f = function(arg0) {
        var ret = getObject(arg0).stack;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_e115855ddb04dc57 = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_self_8deb04d7a9bdc7ad = function(arg0) {
        var ret = getObject(arg0).self;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_693216e109162396 = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_09919627ac0992f5 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_request_87918da6c5db9026 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).request(RequestArguments.__wrap(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getproviderjs_3b30755748206159 = function() { return handleError(function () {
        var ret = get_provider_js();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_on_c9669bfc0578089b = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).on(getStringFromWasm0(arg1, arg2), getObject(arg3));
    };
    imports.wbg.__wbg_removeListener_061a7a78893a7aa0 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).removeListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    };
    imports.wbg.__wbg_Window_f826a1dec163bacb = function(arg0) {
        var ret = getObject(arg0).Window;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_WorkerGlobalScope_967d186155183d38 = function(arg0) {
        var ret = getObject(arg0).WorkerGlobalScope;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_deviceinterface_ab4a2b827bbf7f07 = function() { return handleError(function (arg0) {
        var ret = device_interface(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getwebusb_8b0495ce21ba96b6 = function() {
        var ret = get_webusb();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearTimeout_4e98c029ba287aa7 = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
    imports.wbg.__wbg_setTimeout_70c992dca877b507 = function(arg0, arg1) {
        var ret = setTimeout(getObject(arg0), arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_BigInt_73b2c10d8e6eb5a5 = function(arg0, arg1) {
        u32CvtShim[0] = arg0;
        u32CvtShim[1] = arg1;
        const n0 = int64CvtShim[0];
        var ret = BigInt(n0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_BigInt_1a499fbb5f402f4c = function(arg0, arg1) {
        u32CvtShim[0] = arg0;
        u32CvtShim[1] = arg1;
        const n0 = uint64CvtShim[0];
        var ret = BigInt(n0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_BigInt_4365947136b5327c = function(arg0, arg1) {
        var ret = BigInt(getObject(arg1));
        int64CvtShim[0] = ret;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        getInt32Memory0()[arg0 / 4 + 1] = high0;
        getInt32Memory0()[arg0 / 4 + 0] = low0;
    };
    imports.wbg.__wbg_BigInt_6b6f34a01a71ad51 = function(arg0, arg1) {
        var ret = BigInt(getObject(arg1));
        uint64CvtShim[0] = ret;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        getInt32Memory0()[arg0 / 4 + 1] = high0;
        getInt32Memory0()[arg0 / 4 + 0] = low0;
    };
    imports.wbg.__wbg_String_7462bcc0fcdbaf7d = function(arg0, arg1) {
        var ret = String(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_get_093fe3cdafaf8976 = function(arg0, arg1) {
        var ret = getObject(arg0)[takeObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_e93b31d47b90bff6 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_process_70251ed1291754d5 = function(arg0) {
        var ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_b23f2588cdb2ddbb = function(arg0) {
        var ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_61b8c9a82499895d = function(arg0) {
        var ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_2f56257a38275dbd = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_d07655bf62361f21 = function(arg0) {
        var ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_NODE_MODULE_33b45247c55045b0 = function() {
        var ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_2a93bc09fee45aca = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_fb6b088efb6bead2 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_654a7797990fb8db = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_c4b70662a0d2c5ec = function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_performance_947628766699c5bb = function(arg0) {
        var ret = getObject(arg0).performance;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_indexedDB_9775c4809e82d047 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).indexedDB;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_2c1ba0016d8bca41 = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_fetch_cfe0d1dd786e9cd4 = function(arg0, arg1) {
        var ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_df66d951b1726b78 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_c1f246d6874c0679 = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_setTimeout_5314850184d61a44 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_count_c140710406e423dc = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).count(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_f7688296d184caca = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).getAll(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_93935b044ddc155f = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).getAllKeys(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_30a5b77d2c21c70b = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).openCursor();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_62591eaf55fc078a = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).openCursor(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonopen_33b75427f7db7ce1 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_cb55f0521ac0da3a = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_7094f96283d130e0 = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_ca5f75e4a84134ef = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_new_982fe22cd93d67f7 = function() { return handleError(function (arg0, arg1) {
        var ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_e0d47eb0c1bde0ed = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).close(arg1);
    }, arguments) };
    imports.wbg.__wbg_send_503c2e7652e95bf5 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbDatabase_8ab42e0cd6d7c2b5 = function(arg0) {
        var ret = getObject(arg0) instanceof IDBDatabase;
        return ret;
    };
    imports.wbg.__wbg_close_227800cb941ba76f = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_createObjectStore_64f2dcf0dd615e9f = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_5ecbf79e148f910f = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).transaction(getObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_5357fedb30848723 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_key_6802d023599b2b40 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).key;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_continue_816d63f62ffe6ce7 = function() { return handleError(function (arg0) {
        getObject(arg0).continue();
    }, arguments) };
    imports.wbg.__wbg_continue_806f1feae3035e16 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).continue(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_instanceof_UsbDevice_0608dc5a58c63e6c = function(arg0) {
        var ret = getObject(arg0) instanceof USBDevice;
        return ret;
    };
    imports.wbg.__wbg_vendorId_88d131dc3f01531b = function(arg0) {
        var ret = getObject(arg0).vendorId;
        return ret;
    };
    imports.wbg.__wbg_productId_b569cb0843f07fa5 = function(arg0) {
        var ret = getObject(arg0).productId;
        return ret;
    };
    imports.wbg.__wbg_serialNumber_c1e41a3966c441cc = function(arg0, arg1) {
        var ret = getObject(arg1).serialNumber;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_opened_909e5a5d9605e20d = function(arg0) {
        var ret = getObject(arg0).opened;
        return ret;
    };
    imports.wbg.__wbg_claimInterface_73c2ca90368018f1 = function(arg0, arg1) {
        var ret = getObject(arg0).claimInterface(arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_open_bc9b91b8903f6b3d = function(arg0) {
        var ret = getObject(arg0).open();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_reset_a9faf3355def4cfa = function(arg0) {
        var ret = getObject(arg0).reset();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_selectConfiguration_e002ac9bd079bf8a = function(arg0, arg1) {
        var ret = getObject(arg0).selectConfiguration(arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_transferIn_7453d2f1ecf6b528 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).transferIn(arg1, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_transferOut_d096225fcd03b73b = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).transferOut(arg1, getArrayU8FromWasm0(arg2, arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_error_cc38ce2b4b661e1d = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_e0c9813e6fd3bdc1 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_3445347661d4505e = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_instanceof_IdbCursorWithValue_db34d99fceacebf2 = function(arg0) {
        var ret = getObject(arg0) instanceof IDBCursorWithValue;
        return ret;
    };
    imports.wbg.__wbg_value_d44f1dfdc7c89f28 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).value;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbTransaction_451c7445f35646ea = function(arg0) {
        var ret = getObject(arg0) instanceof IDBTransaction;
        return ret;
    };
    imports.wbg.__wbg_setonabort_8803e75b6faf7afa = function(arg0, arg1) {
        getObject(arg0).onabort = getObject(arg1);
    };
    imports.wbg.__wbg_objectStore_c94a6ee2208cf88e = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Response_e1b11afbefa5b563 = function(arg0) {
        var ret = getObject(arg0) instanceof Response;
        return ret;
    };
    imports.wbg.__wbg_status_6d8bb444ddc5a7b2 = function(arg0) {
        var ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_arrayBuffer_b8937ed04beb0d36 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_text_8279d34d73e43c68 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getDevices_d2c1bce8982b9dac = function(arg0) {
        var ret = getObject(arg0).getDevices();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestDevice_74ac7b8cbfddf409 = function(arg0, arg1) {
        var ret = getObject(arg0).requestDevice(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_add_37ba06e3d1562cd6 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).add(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clear_8fc4908794dd6453 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).clear();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_count_495125080342f042 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).count();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createIndex_0f3717feb69ed5e3 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        var ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4), getObject(arg5));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createIndex_75b07302ae716457 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        var ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_delete_6ec066a612baf8e1 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).delete(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_8adb48dc8e42d894 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).getAll();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_index_1a210b365f535875 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).index(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_put_6a4809badb84e83f = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).put(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_DomException_3eda58454e9b214b = function(arg0) {
        var ret = getObject(arg0) instanceof DOMException;
        return ret;
    };
    imports.wbg.__wbg_code_18a1e10cf380ddc6 = function(arg0) {
        var ret = getObject(arg0).code;
        return ret;
    };
    imports.wbg.__wbg_setonupgradeneeded_842bb46cfc88ed67 = function(arg0, arg1) {
        getObject(arg0).onupgradeneeded = getObject(arg1);
    };
    imports.wbg.__wbg_now_559193109055ebad = function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_open_d2a2f5d23385fe35 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbVersionChangeEvent_3b6249b556504640 = function(arg0) {
        var ret = getObject(arg0) instanceof IDBVersionChangeEvent;
        return ret;
    };
    imports.wbg.__wbg_oldVersion_9928d1bc3cf1e3fe = function(arg0) {
        var ret = getObject(arg0).oldVersion;
        return ret;
    };
    imports.wbg.__wbg_newVersion_81e0f2bf047e3dc1 = function(arg0, arg1) {
        var ret = getObject(arg1).newVersion;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_headers_4764f5445b6a6c89 = function(arg0) {
        var ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_9b0fa00478c37287 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_UsbInTransferResult_23059baee1b8bf7c = function(arg0) {
        var ret = getObject(arg0) instanceof USBInTransferResult;
        return ret;
    };
    imports.wbg.__wbg_data_d909667e096b77dd = function(arg0) {
        var ret = getObject(arg0).data;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_CloseEvent_30d4cfe3a0d027a7 = function(arg0) {
        var ret = getObject(arg0) instanceof CloseEvent;
        return ret;
    };
    imports.wbg.__wbg_code_c8c420857439c0b4 = function(arg0) {
        var ret = getObject(arg0).code;
        return ret;
    };
    imports.wbg.__wbg_result_845fffb3888eb139 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).result;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_error_e6460643fc9523fb = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_830fa880cc3f4a92 = function(arg0) {
        var ret = getObject(arg0).transaction;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setonsuccess_d00fc7d1a2cdf06b = function(arg0, arg1) {
        getObject(arg0).onsuccess = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_eb65293e086348c9 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_instanceof_MessageEvent_38cc16e9af008907 = function(arg0) {
        var ret = getObject(arg0) instanceof MessageEvent;
        return ret;
    };
    imports.wbg.__wbg_data_9e55e7d79ab13ef1 = function(arg0) {
        var ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_bound_a80ce4bf36b46f34 = function() { return handleError(function (arg0, arg1) {
        var ret = IDBKeyRange.bound(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_only_e720b56fbac2d9f8 = function() { return handleError(function (arg0) {
        var ret = IDBKeyRange.only(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_67189fe0b323d288 = function(arg0, arg1) {
        var ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_42e02f5a04d67464 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_949bbc1147195c4e = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_newnoargs_be86524d73f67598 = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_ac32179a660db4bb = function() {
        var ret = new Map();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_c4151d46d5fa7097 = function(arg0) {
        var ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_7720502039b96d00 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_b06cf0578e89ff68 = function(arg0) {
        var ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_e74a542443d92451 = function(arg0) {
        var ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_4fc4ce93e6b92958 = function() {
        var ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_4d0f21c2f823742e = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_888d259a5fefc347 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_0b83d3df67ecb33e = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_c6fbdfc2918d5e58 = function() { return handleError(function () {
        var ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_baec038b5ab35c54 = function() { return handleError(function () {
        var ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_3f735a5746d41fbd = function() { return handleError(function () {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_1bc0b39582740e95 = function() { return handleError(function () {
        var ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_1820441f7fb79aad = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_from_3a079295289ec0d1 = function(arg0) {
        var ret = Array.from(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_forEach_538bda7d7def6b17 = function(arg0, arg1, arg2) {
        try {
            var state0 = {a: arg1, b: arg2};
            var cb0 = (arg0, arg1, arg2) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_349(a, state0.b, arg0, arg1, arg2);
                } finally {
                    state0.a = a;
                }
            };
            getObject(arg0).forEach(cb0);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_isArray_eb7ad55f2da67dde = function(arg0) {
        var ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_push_284486ca27c6aa8b = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_slice_4508a425fcd11c48 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_764b6d4119231cb3 = function(arg0) {
        var ret = getObject(arg0) instanceof ArrayBuffer;
        return ret;
    };
    imports.wbg.__wbg_buffer_45280fecb82c83df = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_byteLength_c9e4f1b2bae8fc4d = function(arg0) {
        var ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_561efcb1265706d8 = function(arg0) {
        var ret = getObject(arg0) instanceof Error;
        return ret;
    };
    imports.wbg.__wbg_new_342a24ca698edd87 = function(arg0, arg1) {
        var ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_message_9f7d15ff97fc4102 = function(arg0) {
        var ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_5a42234155690dbc = function(arg0) {
        var ret = getObject(arg0).name;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_346669c262382ad7 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_8a893cac80deeb51 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_a46091b120cc63e9 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_0dfc6d38b7184f06 = function(arg0) {
        var ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_getTime_10d33f4f2959e5dd = function(arg0) {
        var ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_d3e5a22a1b7fb1d8 = function(arg0) {
        var ret = getObject(arg0).getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_new0_fd3a3a290b25cdac = function() {
        var ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_af172eabe2e041ad = function() {
        var ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_instanceof_Object_66786225e0dbc8ba = function(arg0) {
        var ret = getObject(arg0) instanceof Object;
        return ret;
    };
    imports.wbg.__wbg_entries_aadf9c3f38203a12 = function(arg0) {
        var ret = Object.entries(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_0f5efc7977a2c50b = function(arg0, arg1) {
        var ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_toString_2e47dd24bf81cc0b = function(arg0) {
        var ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_b1d61b5687f5e73a = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_416(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            var ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_d23068002f584f22 = function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_2fcac196782070cc = function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_8c2d62e8ae5978f7 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_397eaa4d72ee94dd = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_4b9b8c4e3f5adbff = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_a7ce447f15ff496f = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_969ad0a60e51d320 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_1eb8fc608a0d4cdb = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_08a1f3a179095e76 = function(arg0) {
        var ret = getObject(arg0) instanceof Uint8Array;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_929232475839a482 = function(arg0) {
        var ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_8b658422a224f479 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_1275b5eec3dc7a7a = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_82a4e8a85e31ac42 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_d5bd2d655fdf256a = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_getRandomValues_f5e14ab7ac8e995d = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_self_1b7a39e3a92c949c = function() { return handleError(function () {
        var ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_968f1772287e2df0 = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_a3d34b4fee3c2869 = function(arg0) {
        var ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_604837428532a733 = function(arg0, arg1) {
        var ret = require(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper23177 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 7138, __wbg_adapter_40);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper24038 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 7455, __wbg_adapter_43);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper25149 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 7804, __wbg_adapter_46);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper25262 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 7858, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper27535 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 8462, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper27782 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 8557, __wbg_adapter_55);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper28007 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 8652, __wbg_adapter_58);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

