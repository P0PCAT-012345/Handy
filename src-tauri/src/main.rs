// src-tauri/src/main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::State;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Landmark {
    x: f32,
    y: f32,
    z: f32,
}

#[tauri::command]
fn update_landmark(landmarks: Vec<Vec<Landmark>>) {
    for (hand_index, hand_landmarks) in landmarks.iter().enumerate() {
        // println!("Hand {}: {:?}", hand_index, hand_landmarks);
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![update_landmark])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
