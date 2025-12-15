<?php

// PS C:\Users\mling\Desktop\WET\test> php artisan make:policy AlbumPolicy --model=Album

namespace App\Policies;

use App\Models\Album;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AlbumPolicy {
    
// Determine whether the user can update the model (User 2/3)--------

    /*
        public function update(User $user, Album $album): bool{
            return false;
        }
    */

    public function update(User $user, Album $album) {
        return $user->id === $album->uploaded_by || $user->is_admin;
    }

// Determine whether the user can delete the model (User 2/3) --------
    /*
        public function delete(User $user, Album $album): bool {
            return false;
        }
    */

    public function delete(User $user, Album $album) {
        return $user->id === $album->uploaded_by || $user->is_admin;
    }

    
//_____________________________________________________________________________________________________
//Yet to be seen if useed...

/*
    // Determine whether the user can view any models -------
        public function viewAny(User $user): bool {
            return false;
        }

    // Determine whether the user can view the model -------
        public function view(User $user, Album $album): bool {
            return false;
        }

    // Determine whether the user can create models -------
        public function create(User $user): bool {
            return false;
        }

    // Determine whether the user can restore the model -------
        public function restore(User $user, Album $album): bool {
            return false;
        }

    // Determine whether the user can permanently delete the model ------

        public function forceDelete(User $user, Album $album): bool{
            return false;
        }
    }
*/

}

