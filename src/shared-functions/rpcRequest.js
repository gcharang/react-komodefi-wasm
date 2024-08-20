import { Mm2RpcErr, mm2_rpc } from '../js/kdflib.js';

export async function rpc_request(request_js) {
  try {
    const response = await mm2_rpc(request_js);
    console.log(response);
    return response;
  } catch (e) {
    switch (e) {
      case Mm2RpcErr.NotRunning:
        alert('KDF is not running yet');
        break;
      case Mm2RpcErr.InvalidPayload:
        alert(`Invalid payload: ${request_js}`);
        break;
      case Mm2RpcErr.InternalError:
        alert(`An KDF internal error`);
        break;
      default:
        alert(`Unexpected error: ${e}`);
        break;
    }
  }
}
