import { merge } from "lodash";
import Button from "./Button";

export default function ComponentsOverride(theme) {
  return merge(Button(theme));
}
