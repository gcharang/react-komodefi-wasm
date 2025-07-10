import React, { useState, useEffect } from "react";

const useIsValidSchema = (schema: string): [boolean, React.Dispatch<React.SetStateAction<boolean>>, (schema: string) => boolean] => {
  const [isValid, setIsValid] = useState(true);

  const checkIfSchemaValid = (schema: string): boolean => {
    try {
      if (JSON.parse(schema)) return true;
    } catch (error) {
      return false;
    }
    return false;
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