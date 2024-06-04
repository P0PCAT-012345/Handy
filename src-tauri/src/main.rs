#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use tauri::{command, State};
use std::sync::Mutex;
use std::fs::{self, File};
use std::io::Write;
use std::env;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Landmark {
    x: f32,
    y: f32,
    z: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct HandLandmarks {
    landmarks: Vec<Landmark>,
}

struct AppState {
    recording: bool,
    recorded_landmarks: Vec<HandLandmarks>,
}

impl AppState {
    fn convert_landmarks(hand_landmarks: Vec<HandLandmarks>) -> Vec<Vec<Vec<f32>>> {
        hand_landmarks
            .into_iter()
            .map(|hand_landmark| {
                hand_landmark.landmarks
                    .into_iter()
                    .map(|landmark| vec![landmark.x, landmark.y, landmark.z])
                    .collect()
            })
            .collect()
    }
    
    fn new() -> Self {
        AppState {
            recording: false,
            recorded_landmarks: vec![],
        }
    }
}

#[command]
fn update_landmark(state: State<Mutex<AppState>>, landmarks: Vec<Vec<Landmark>>) {
    let mut app_state = state.lock().unwrap();
    if app_state.recording {
        for landmark in landmarks {
            app_state.recorded_landmarks.push(HandLandmarks { landmarks: landmark });
        }
    }
}

#[command]
fn record(state: State<Mutex<AppState>>) -> String {
    let app_state = state.lock().unwrap();
    let mut points = vec![];
    for hand_landmarks in &app_state.recorded_landmarks {
        for landmark in &hand_landmarks.landmarks {
            points.push(format!("x: {}, y: {}, z: {}", landmark.x, landmark.y, landmark.z));
        }
    }
    points.join(", ")
}

#[command]
fn on_recording_clicked(state: State<Mutex<AppState>>) -> String {
    let mut app_state = state.lock().unwrap();
    if app_state.recording {
        // Stop recording
        app_state.recording = false;
        println!("Recording stopped. Recorded landmarks: {:?}", app_state.recorded_landmarks);
        format!("Recording stopped. Recorded {} landmarks.", app_state.recorded_landmarks.len())
    } else {
        // Start recording
        app_state.recording = true;
        app_state.recorded_landmarks.clear();
        println!("Recording started.");
        "Recording started.".to_string()
    }
}

#[command]
fn save_recording(state: State<Mutex<AppState>>, filename: String) -> Result<String, String> {
    let app_state = state.lock().unwrap();
    println!("Recorded landmarks to save: {:?}", app_state.recorded_landmarks);

    let folder_name = "Handy Database";
    let file_path = format!("{}/{}.json", folder_name, filename);
    if let Err(e) = fs::create_dir_all(folder_name) {
        return Err(format!("Failed to create directory: {}", e));
    }
    match env::current_dir() {
        Ok(path) => println!("Current working directory: {}", path.display()),
        Err(e) => println!("Failed to get current working directory: {}", e),
    }
    println!("Recording: {}", app_state.recorded_landmarks.len());
    let num_landmarks = AppState::convert_landmarks(app_state.recorded_landmarks.clone());
    println!("Converted landmarks: {}", num_landmarks.len());
    let encoded = serde_json::to_string(&num_landmarks).map_err(|e| e.to_string())?;
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(encoded.as_bytes()).map_err(|e| e.to_string())?;
    println!("Recording saved at: {}", file_path);

    Ok(file_path)
}

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(AppState::new()))
        .invoke_handler(tauri::generate_handler![
            update_landmark,
            record,
            on_recording_clicked,
            save_recording
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}