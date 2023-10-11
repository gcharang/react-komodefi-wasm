import React, { useState, useEffect } from "react";

const useIsValidSchema = (schema) => {
  const [isValid, setIsValid] = useState(true);

  const checkIfSchemaValid = (schema) => {
    try {
      if (JSON.parse(schema)) return true;
    } catch (error) {
      return false;
    }
  };
  useEffect(() => {
    try {
      if (JSON.parse(schema)) setIsValid(true);
      return;
    } catch (error) {
      setIsValid(false);
      return;
    }
  }, [schema]);
  return [isValid, setIsValid, checkIfSchemaValid];
};

export default useIsValidSchema;
