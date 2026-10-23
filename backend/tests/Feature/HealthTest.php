<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * The health check a host's monitoring and load balancer call. It answers
 * without a database query or a session, so it stays cheap to call often.
 */
class HealthTest extends TestCase
{
    public function test_the_health_check_answers(): void
    {
        $this->get('/up')->assertOk();
    }

    public function test_the_health_check_is_not_rate_limited_as_api_traffic(): void
    {
        $this->get('/up')->assertHeaderMissing('X-RateLimit-Limit');
    }
}
