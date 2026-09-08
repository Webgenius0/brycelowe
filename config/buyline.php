<?php

return [

    'api_url' => env('BUYLINE_API_URL', 'https://staging.apply.buyline.co.uk/api/v1'),

    'api_key' => env('BUYLINE_API_KEY'),

    'client_id' => env('BUYLINE_CLIENT_ID'),

    'webhook_secret' => env('BUYLINE_WEBHOOK_SECRET'),

    'success_url' => env('BUYLINE_SUCCESS_URL'),

    'failure_url' => env('BUYLINE_FAILURE_URL'),

];
