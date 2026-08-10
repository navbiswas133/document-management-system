import { vi } from 'vitest';

const mockApiPost = vi.fn();

export function getMockApiPost() {
  return mockApiPost;
}

export default {
  post: mockApiPost,
};
