package com.ocr; // Replace with your actual package name

import android.content.Context;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import java.io.File;

public class TesseractModule extends ReactContextBaseJavaModule {
    private static final String TAG = "TesseractModule";

    public TesseractModule(ReactApplicationContext reactContext) {
        super(reactContext);
        initTessDataDir(reactContext);
    }

    @Override
    public String getName() {
        return "TesseractModule";
    }

    private void initTessDataDir(Context context) {
        try {
            File tessDataDir = new File(context.getFilesDir(), "tessdata");
            if (!tessDataDir.exists()) {
                boolean created = tessDataDir.mkdirs();
                Log.d(TAG, "TessData directory created: " + created);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error creating tessdata directory", e);
        }
    }
}