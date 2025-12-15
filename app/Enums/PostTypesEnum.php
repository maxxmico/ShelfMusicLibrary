<?php

namespace App\Enums;

enum PostTypesEnum: string {
    case Song = 'song';
    case Album = 'album';
    case Concert = 'concert';
}
