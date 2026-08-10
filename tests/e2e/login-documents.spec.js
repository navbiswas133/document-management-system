import { test, expect } from '@playwright/test';

const TEST_MOBILE = '9000000001';
const TEST_OTP = '000000';
const FAKE_E2E_TOKEN = 'e2e-test-token-fake';

const MOCK_DOCUMENT = {
  document_id: 'e2e-doc-1',
  major_head: 'Personal',
  minor_head: 'John',
  document_date: '2024-01-15',
  file_url: 'https://example.com/files/e2e-sample.pdf',
  document_remarks: 'E2E Sample Document',
  total_count: 1,
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
      await fulfillJson(route, {
        status: true,
        data: {
          token: FAKE_E2E_TOKEN,
          user_id: 'e2e-user-1',
          user_name: 'E2E Test User',
          roles: ['User'],
        },
      });
      return;
    }

    if (url.includes('/searchDocumentEntry')) {
      await fulfillJson(route, {
        status: true,
        recordsTotal: 1,
        data: [MOCK_DOCUMENT],
      });
      return;
    }

    if (url.includes('/documentTags')) {
      await fulfillJson(route, {
        status: true,
        data: [{ label: 'finance', id: 'finance' }],
      });
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

test('authenticated user can log in and view mocked documents', async ({ page }) => {
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
  await expect(page.getByRole('heading', { name: 'Recent Documents' })).toBeVisible();
  await expect(page.getByText('Unable to load recent documents')).not.toBeVisible();

  await page
    .getByRole('complementary', { name: 'Main navigation' })
    .getByRole('link', { name: 'Documents' })
    .click();

  await expect(page).toHaveURL(/\/documents$/);
  await expect(page.getByText('Loading documents…')).not.toBeVisible();
  await expect(page.getByText('E2E Sample Document')).toBeVisible();
  await expect(page.getByText('No documents found')).not.toBeVisible();
  await expect(page.getByText('Authentication required.')).not.toBeVisible();
});
