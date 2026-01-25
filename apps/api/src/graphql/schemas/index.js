import { userSchema } from "./user.schema.js";
import { projectSchema } from "./project.schema.js";

export const schema = `
  ${userSchema}
  ${projectSchema}
`;
