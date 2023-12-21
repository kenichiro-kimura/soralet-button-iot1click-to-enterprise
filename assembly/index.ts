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
import dayjs from "dayjs";
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
  
  let remainingLife : f64 = batteryLevel_number * 100;

  // get tag value

  const tag_user = getTagValue("user");
  const tag_token = getTagValue("token");
  const tag_dsn = getTagValue("dsn");
/*  
{
  "deviceInfo": {
    "deviceId": "XXXXXXXXXXXXXXXX",
    "type": "button",
    "remainingLife": 99.933334,
    "attributes": {
      "projectRegion": "ap-northeast-1",
      "projectName": "projectName",
      "placementName": "placementName",
      "deviceTemplateName": "deviceTemplateName"
    }
  },
  "deviceEvent": {
    "buttonClicked": {
      "clickType": "SINGLE",
      "reportedTime": "2018-11-05T04:29:01.950Z"
    }
  },
  "placementInfo": {
    "projectName": "projectName",
    "placementName": "ButtonName",
    "attributes": {},
    "devices": {
      "deviceTemplateName": "XXXXXXXXXXXXXXXX"
    }
  }
}
*/
  encoder.pushObject("deviceInfo");
  encoder.setString("deviceId",tag_dsn);
  encoder.setString("type","button");
  encoder.setFloat("remainingLife",remainingLife);
  encoder.popObject();

  encoder.pushObject("deviceEvent");
  encoder.pushObject("buttonClicked");
  encoder.setString("clickType",clickTypeName_string);
  encoder.setString("reportedTime",dayjs().toISOString());
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
