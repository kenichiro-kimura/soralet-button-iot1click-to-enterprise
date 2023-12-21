import {
  setOutputJSON,
  log,
  getLocation,
  getTagValue,
  getSourceValue,
  getTimestamp,
  getUserdata,
  getInputBufferAsString,
} from "orbit-sdk-assemblyscript";

import { JSON, JSONEncoder } from "assemblyscript-json";

/**
 * process uplink (device -> SORACOM) message
 */
export function uplink(): i32 {
  // decode input string as JSON string
  let data: JSON.Obj = <JSON.Obj>(JSON.parse(getInputBufferAsString()));

  // create a new encoder which will be used to generate final JSON string
  const encoder = new JSONEncoder();
  
  const clickTypeName = data.getString("clickTypeName");
  const clickTypeName_string = clickTypeName === null ? "" : clickTypeName.valueOf();
  const batteryLevel = data.getFloat("batteryLevel");
  const batteryLevel_number = batteryLevel === null ? 0.0 : batteryLevel.valueOf();

  const remainingLife: f64 = batteryLevel === null ? 100.0 : batteryLevel_number * 100.0;
  
  // get tag value

  const tag_user = getTagValue("user");
  const tag_token = getTagValue("token");
  const tag_dsn = getTagValue("DSN");

  // setup output JSON

  encoder.pushObject("deviceInfo");
  encoder.setString("deviceId",tag_dsn);
  encoder.setString("type","button");
  encoder.setFloat("remainingLife",remainingLife);
  encoder.popObject();

  encoder.pushObject("deviceEvent");
  encoder.pushObject("buttonClicked");
  encoder.setString("clickType",clickTypeName_string);
  encoder.setString("reportedTime",(new Date(getTimestamp())).toISOString());
  encoder.popObject();
  encoder.popObject();

  encoder.pushObject("placementInfo");
  encoder.pushObject("attributes");
  encoder.setString("user",tag_user);
  encoder.setString("token",tag_token);
  encoder.popObject();
  encoder.popObject();

  // set output JSON. Note that we have to wrap result with {}
  setOutputJSON("{" + encoder.toString() + "}");

  // return user defined result code for success
  return 0;
}
