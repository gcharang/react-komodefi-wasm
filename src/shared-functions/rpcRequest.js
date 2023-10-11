import { Mm2RpcErr, mm2_rpc } from "../js/mm2";

export async function rpc_request(request_js) {
  try {
    const response = await mm2_rpc(request_js);
    console.log(response);
    return response;
  } catch (e) {
    switch (e) {
      case Mm2RpcErr.NotRunning:
        alert("MM2 is not running yet");
        break;
      case Mm2RpcErr.InvalidPayload:
        alert(`Invalid payload: ${request_js}`);
        break;
      case Mm2RpcErr.InternalError:
        alert(`An MM2 internal error`);
        break;
      default:
        alert(`Unexpected error: ${e}`);
        break;
    }
  }
}
