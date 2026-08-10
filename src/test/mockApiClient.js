import { getMockApiPost } from '../lib/__mocks__/axios';

export { getMockApiPost };

export function mockApiSuccess(data) {
  getMockApiPost().mockResolvedValueOnce({ data });
}

export function mockApiFailure(message) {
  getMockApiPost().mockResolvedValueOnce({
    data: {
      status: false,
      message,
    },
  });
}
