import { default as common } from "./webpack.common.js";
import { merge } from "webpack-merge";

export default merge(common, {
  mode: "production",
});
