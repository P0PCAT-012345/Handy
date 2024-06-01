// src-tauri/src/main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use tauri::State;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Landmark {
    x: f32,
    y: f32,
    z: f32,
}

// Define a global variable to store the landmarks
lazy_static::lazy_static! {
    static ref LANDMARKS: Mutex<Vec<Vec<Landmark>>> = Mutex::new(Vec::new());
}

#[tauri::command]
fn update_landmark(landmarks: Vec<Vec<Landmark>>) {
    let mut landmarks_storage = LANDMARKS.lock().unwrap();
    *landmarks_storage = landmarks;
}

#[tauri::command]
fn record() {
    let landmarks_storage = LANDMARKS.lock().unwrap();
    if let Some(latest_landmarks) = landmarks_storage.last() {
        println!("{:?}", latest_landmarks);
    } else {
        println!("No landmarks recorded yet.");
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![update_landmark, record])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
