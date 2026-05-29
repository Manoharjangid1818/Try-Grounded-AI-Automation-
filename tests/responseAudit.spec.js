import { test }
from '@playwright/test';

import { ResponseAuditPage }
from '../pages/ResponseAuditPage.js';

test.use({

    storageState: 'auth/user.json'

});

test(

    'Verify Response Audit Works Successfully',

    async ({ page }) => {

        // Create page object
        const auditPage =
            new ResponseAuditPage(page);

        // Open Response Audit page
        await auditPage.openAuditPage();

        // Perform audit
        await auditPage.performAudit(

            'Who are you?',

            'I am Manohar Jangid, QA Trainee Engineer at KiwiQA',

            'I am Manohar Jangid, Employee of KiwiQA Services Pvt Ltd'

        );

        // Verify audit completion
        await auditPage.verifyAuditCompleted();

    }

);