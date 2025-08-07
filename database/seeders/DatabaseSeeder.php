<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            SuperAdminSeeder::class,
            DepartmentSeeder::class,
            ProcedureSeeder::class,
            DoctorSeeder::class,
            AppointmentSeeder::class,
        ]);
    }
}
