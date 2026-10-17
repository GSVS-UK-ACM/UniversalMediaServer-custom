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

import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

public class RendererPlaybackModeTest {

	@TempDir
	Path temporaryDirectory;

	@Test
	public void testModeProperties() {
		assertFalse(RendererPlaybackMode.AUTOMATIC.isRemote());
		assertTrue(RendererPlaybackMode.LOCAL_DIRECT_PLAY.isForceDirectPlay());
		assertEquals(8, RendererPlaybackMode.REMOTE_8_MBPS.getMaximumBitrateMbps());
		assertEquals(4, RendererPlaybackMode.REMOTE_4_MBPS.getMaximumBitrateMbps());
		assertEquals(RendererPlaybackMode.AUTOMATIC, RendererPlaybackMode.fromPersistedValue("not-a-mode"));
	}

	@Test
	public void testModePersistence() {
		Path storePath = temporaryDirectory.resolve("renderer-playback-modes.properties");
		RendererPlaybackModeStore store = new RendererPlaybackModeStore(storePath);
		store.set("phone", RendererPlaybackMode.REMOTE_8_MBPS);

		RendererPlaybackModeStore reloadedStore = new RendererPlaybackModeStore(storePath);
		assertEquals(RendererPlaybackMode.REMOTE_8_MBPS, reloadedStore.get("phone"));

		reloadedStore.set("phone", RendererPlaybackMode.AUTOMATIC);
		assertEquals(
			RendererPlaybackMode.AUTOMATIC,
			new RendererPlaybackModeStore(storePath).get("phone")
		);
	}
}
