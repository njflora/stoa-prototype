<?php

namespace Tests\Feature;

use Illuminate\Foundation\Application;
use Tests\TestCase;

/**
 * The app as it boots in production. Routes are registered at boot, so
 * this class boots its own copy with APP_ENV=production, then puts the
 * testing environment back for the other tests.
 */
class ProductionTest extends TestCase
{
    public function createApplication(): Application
    {
        $this->setEnvironment('production');
        try {
            return parent::createApplication();
        } finally {
            $this->setEnvironment('testing');
        }
    }

    private function setEnvironment(string $env): void
    {
        putenv("APP_ENV={$env}");
        $_ENV['APP_ENV'] = $_SERVER['APP_ENV'] = $env;
    }

    public function test_the_app_runs_as_production(): void
    {
        $this->assertTrue($this->app->isProduction());
    }

    public function test_the_password_less_demo_sign_in_does_not_exist(): void
    {
        $this->postJson('/api/demo/login', ['as' => 'staff'], ['Referer' => 'http://localhost:5174/'])->assertNotFound();
    }
}
