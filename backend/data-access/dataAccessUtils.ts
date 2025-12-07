import { transactionDB } from "./dbOperations";

export function errorHandlerWrapper(functionName: string, func: () => any): any {
  try {
    return func();
  }
  catch (error) {
    console.error(`Database error in ${functionName}: ${error}`);
    throw error;
  }
}

export function transactionWrapper(functionName: string, func: (container: any) => any): any {
  return errorHandlerWrapper(functionName, () => {
    const container: any = {};
    transactionDB(func, container);
    return container;
  });
}