import { test, expect } from '@playwright/test';

const TEST_MOBILE = '9000000001';
const TEST_OTP = '000000';

const MOCK_VALIDATE_OTP_RESPONSE = {
  status: true,
  data: {
    token: 'test-token',
    user_id: 'test_user',
    user_name: 'Test User',
    roles: [
      {
        id: 1,
        role: 'User',
        role_slug: 'USER',
        home: 'document-management',
      },
    ],
  },
};

const MOCK_SEARCH_RESPONSE = {
  status: true,
  recordsTotal: 1,
  data: [
    {
      document_id: 'test-doc-1',
      major_head: 'Personal',
      minor_head: 'John',
      document_date: '2024-01-15',
      file_url: 'https://example.com/files/test-sample.pdf',
      document_remarks: 'Test Search Document',
      total_count: 1,
    },
  ],
};

function fulfillJson(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockDocumentManagementApi(page) {
  await page.route('**/api/documentManagement/**', async (route) => {
    const request = route.request();
    const url = request.url();

    if (request.method() !== 'POST') {
      await route.abort('blockedbyclient');
      return;
    }

    if (url.includes('/generateOTP')) {
      await fulfillJson(route, { status: true, data: { sent: true } });
      return;
    }

    if (url.includes('/validateOTP')) {
      await fulfillJson(route, MOCK_VALIDATE_OTP_RESPONSE);
      return;
    }

    if (url.includes('/searchDocumentEntry')) {
      await fulfillJson(route, MOCK_SEARCH_RESPONSE);
      return;
    }

    await route.abort('blockedbyclient');
  });
}

async function fillOtpDigits(page, otp) {
  for (let index = 0; index < otp.length; index += 1) {
    await page.getByLabel(`OTP digit ${index + 1}`).fill(otp[index]);
  }
}

test.beforeEach(async ({ page }) => {
  await mockDocumentManagementApi(page);
});

test('user journey: login, dashboard, documents search results', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByLabel('Mobile Number')).toBeVisible();
  await expect(page.getByRole('button', { name: /^send otp$/i })).toBeVisible();

  await page.getByLabel('Mobile Number').fill(TEST_MOBILE);
  await page.getByRole('button', { name: /^send otp$/i }).click();

  await expect(page.getByText('Enter OTP')).toBeVisible();
  await expect(page.getByRole('button', { name: /^verify otp$/i })).toBeVisible();

  await fillOtpDigits(page, TEST_OTP);
  await page.getByRole('button', { name: /^verify otp$/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Test User')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible();

  await page
    .getByRole('complementary', { name: 'Main navigation' })
    .getByRole('link', { name: 'Documents' })
    .click();

  await expect(page).toHaveURL(/\/documents$/);
  await expect(page.getByLabel('Search documents')).toBeVisible();
  await expect(page.getByText('Loading documents…')).not.toBeVisible();
  await expect(page.getByText('Test Search Document')).toBeVisible();

  await page.getByLabel('Search documents').fill('Test');
  await expect(page.getByText('Test Search Document')).toBeVisible();

  await expect(page.getByText('No documents found')).not.toBeVisible();
  await expect(page.getByText('Authentication required.')).not.toBeVisible();
  await expect(page.getByText('Unable to load documents.')).not.toBeVisible();
});
