/*
 * This file is part of Universal Media Server, based on PS3 Media Server.
 *
 * This program is a free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; version 2 of the License only.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */
package net.pms.renderers;

import java.util.Locale;
import net.pms.Messages;

/**
 * Per-device playback policies that can be selected without replacing the
 * renderer profile used for device compatibility.
 */
public enum RendererPlaybackMode {
	AUTOMATIC("automatic", "RendererPlaybackMode.Automatic", 0, false),
	LOCAL_DIRECT_PLAY("local-direct-play", "RendererPlaybackMode.LocalDirectPlay", 0, true),
	REMOTE_8_MBPS("remote-8-mbps", "RendererPlaybackMode.Remote8Mbps", 8, false),
	REMOTE_4_MBPS("remote-4-mbps", "RendererPlaybackMode.Remote4Mbps", 4, false);

	private final String persistedValue;
	private final String messageKey;
	private final int maximumBitrateMbps;
	private final boolean forceDirectPlay;

	RendererPlaybackMode(String persistedValue, String messageKey, int maximumBitrateMbps, boolean forceDirectPlay) {
		this.persistedValue = persistedValue;
		this.messageKey = messageKey;
		this.maximumBitrateMbps = maximumBitrateMbps;
		this.forceDirectPlay = forceDirectPlay;
	}

	public String getPersistedValue() {
		return persistedValue;
	}

	public int getMaximumBitrateMbps() {
		return maximumBitrateMbps;
	}

	public boolean isRemote() {
		return maximumBitrateMbps > 0;
	}

	public boolean isForceDirectPlay() {
		return forceDirectPlay;
	}

	public static RendererPlaybackMode fromPersistedValue(String value) {
		if (value != null) {
			String normalized = value.trim().toLowerCase(Locale.ROOT);
			for (RendererPlaybackMode mode : values()) {
				if (mode.persistedValue.equals(normalized)) {
					return mode;
				}
			}
		}
		return AUTOMATIC;
	}

	@Override
	public String toString() {
		return Messages.getGuiString(messageKey);
	}
}
