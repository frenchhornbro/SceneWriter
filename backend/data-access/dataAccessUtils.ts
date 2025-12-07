export function errorHandlerWrapper(functionName: string, func: () => any): any {
  try {
    return func();
  }
  catch (error) {
    console.error(`Database error in ${functionName}: ${error}`);
    throw error;
  }
}