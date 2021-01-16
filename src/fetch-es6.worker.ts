export interface ResponseData {
  status: number;
  statusText: string;
  json: JSON;
  text: string;
}

export async function loadData(request: RequestInfo): Promise<ResponseData> {
  const response: Response = await fetch(request);
  const data = {
    status: null, statusText: null, json: null, text: null
  };
  try {

    data.status = response.status;
    data.statusText = response.statusText;
    data.text = await response.text();
    data.json = JSON.parse(data.text);
  } catch (ex) {
    // expect to failed if no body
    console.warn("Error during read data of response " + ex);
  }

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return data;
}


