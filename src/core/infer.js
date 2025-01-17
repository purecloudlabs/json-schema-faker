/*
   DEVENGAGE-92

   Removed the 'maxItems','minItems' from the inferredProperties.array field.   We were having a problem where the 
   ValidationLimits field contains the minItems and maxItems fields and as result the Schema Faker was treating these items as 
   an array rather then an integer.  I talked with Tim Smith and we are just going to remove these attributes from the array
   inferred property list.
*/
const inferredProperties = {
  array: ["additionalItems", "items", "uniqueItems"],
  integer: [
    "exclusiveMaximum",
    "exclusiveMinimum",
    "maximum",
    "minimum",
    "multipleOf",
  ],
  object: [
    "additionalProperties",
    "dependencies",
    "maxProperties",
    "minProperties",
    "patternProperties",
    "properties",
    "required",
  ],
  string: ["maxLength", "minLength", "pattern", "format"],
};

inferredProperties.number = inferredProperties.integer;

const subschemaProperties = [
  "additionalItems",
  "items",
  "additionalProperties",
  "dependencies",
  "patternProperties",
  "properties",
];

/**
 * Iterates through all keys of `obj` and:
 * - checks whether those keys match properties of a given inferred type
 * - makes sure that `obj` is not a subschema; _Do not attempt to infer properties named as subschema containers. The
 * reason for this is that any property name within those containers that matches one of the properties used for
 * inferring missing type values causes the container itself to get processed which leads to invalid output. (Issue 62)_
 *
 * @returns {boolean}
 */
function matchesType(obj, lastElementInPath, inferredTypeProperties) {
  return (
    Object.keys(obj).filter((prop) => {
      const isSubschema = subschemaProperties.indexOf(lastElementInPath) > -1;
      const inferredPropertyFound = inferredTypeProperties.indexOf(prop) > -1;

      if (inferredPropertyFound && !isSubschema) {
        return true;
      }

      return false;
    }).length > 0
  );
}

/**
 * Checks whether given `obj` type might be inferred. The mechanism iterates through all inferred types definitions,
 * tries to match allowed properties with properties of given `obj`. Returns type name, if inferred, or null.
 *
 * @returns {string|null}
 */
function inferType(obj, schemaPath) {
  const keys = Object.keys(inferredProperties);

  for (let i = 0; i < keys.length; i += 1) {
    const typeName = keys[i];
    const lastElementInPath = schemaPath[schemaPath.length - 1];

    if (matchesType(obj, lastElementInPath, inferredProperties[typeName])) {
      return typeName;
    }
  }
}

export default inferType;
