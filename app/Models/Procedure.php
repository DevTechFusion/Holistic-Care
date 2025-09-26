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
     * Get the appointments for this procedure.
     */
    public function appointments()
    {
        return $this->belongsToMany(Appointment::class, 'appointment_procedures');
    }
}
