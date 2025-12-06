export async function errorHandlerWrapper(functionName: string, func: () => Promise<any>): Promise<any> {
  try {
    return await func();
  }
  catch (error) {
    console.error(`Database error in ${functionName}: ${error}`);
    throw error;
  }
}