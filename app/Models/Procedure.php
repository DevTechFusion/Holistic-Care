<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Procedure extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the users for the procedure.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the doctors for the procedure.
     */
    public function doctors()
    {
        return $this->belongsToMany(Doctor::class, 'doctor_procedure');
    }
}
